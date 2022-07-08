from multiprocessing.connection import wait
from sllurp.llrp import LLRP_PORT, LLRPClientFactory
from twisted.internet import reactor
import threading
import eel
import queue
import logging
import time

import tagDict

class SllurpHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record, level=None):
        level = record.levelno
        
        if level == logging.INFO:
            sev = "info"
        elif level == logging.WARNING:
            sev = "error"
        else:
            sev = "error"

        msg = record.getMessage()
        title = sev
        if len(record.getMessage().split(": ")) > 1:
            title = record.getMessage().split(": ")[0]
            msg = record.getMessage().split(": ")[1]

        if (sev != "info"):
            eel.createAlert(sev, title, msg)
            print(sev, title, msg)
        elif (sev == "info"):
            if (title == "connection failed" ):
                eel.createAlert("error", "Connection failed", "DNS lookup failed. Check the hostname.", "cable")
            if ("connected to" in msg):
                eel.createAlert("success", "Inventory started", "Accepting tags from the reader.", "cable")
        
        eel.readerLog(record.getMessage())


sllurp_logger = logging.getLogger('sllurp')
sllurp_logger.setLevel(logging.INFO)
sllurp_logger.addHandler(SllurpHandler())

class RFIDReader:

    def __init__(self):
        def startThread(args):
            reactor.run(args)
            return

        reactor.addSystemEventTrigger(
            'before', 'shutdown', reactor.callFromThread, reactor.stop)
        self.reader_thread = threading.Thread(
            target=startThread, args=(False,))

        self.isConnected = False
        self.count = 0

    def tagSeen(self, tagReport):
        try:
            tags = tagReport.__dict__.get('msgdict').get(
                'RO_ACCESS_REPORT').get('TagReportData')

            for tag in tags:

                # The EPC is currently bytes, and eel doesn't like it when
                # bytes are passed to the JS, so we need to convert to a
                # string first.
                newTag = {}
                newTag['seen'] = time.time()

                epc = str(tag['EPC-96'], 'utf-8').upper()
                newTag['wispId'] = epc[20:24]
                
                if ((not self.whitelist or newTag['wispId'] in self.whitelist) and (newTag['wispId'] not in self.blacklist)):
                    newTag['epc'] = epc
                    newTag['wispType'] = epc[0:2]
                    newTag['wispData'] = epc[2:18]
                    newTag['wispHwRev'] = epc[18:20]
                    newTag['rssi'] = tag['PeakRSSI'][0]

                    
                    tagTools = tagDict.defs.get(newTag['wispType'])
                    if tagTools:
                        newTag['parsedString'] = tagTools.get('parserString')(newTag['wispData'])
                        newTag['parsed'] = tagTools.get('parser')(newTag['wispData'])

                    eel.acceptTag(newTag)
                    self.count += 1

        except Exception as e:
            # print(e)
            pass


    def startInventory(self, host, port, antennas, tari, tx_power, mode_identifier):
        self.whitelist = []
        self.blacklist = []
        
        if self.isConnected:
            eel.createAlert("error", "Inventory already started", "Stop the inventory before starting a new one")
        else:
            self.isConnected = True
            self.fac = LLRPClientFactory(report_every_n_tags=1,
                                        antennas=antennas,
                                        tx_power=tx_power,
                                        start_inventory=True,
                                        mode_identifier=mode_identifier,
                                        tari=tari,
                                        tag_content_selector={
                                            'EnableROSpecID': True,
                                            'EnableSpecIndex': True,
                                            'EnableInventoryParameterSpecID': True,
                                            'EnableAntennaID': True,
                                            'EnableChannelIndex': True,
                                            'EnablePeakRSSI': True,
                                            'EnableFirstSeenTimestamp': True,
                                            'EnableLastSeenTimestamp': True,
                                            'EnableTagSeenCount': True,
                                            'EnableAccessSpecID': True,
                                        })
            self.fac.addTagReportCallback(self.tagSeen)

            reactor.callFromThread(reactor.connectTCP, host,
                                port, self.fac, timeout=3)
            
            if not self.getAlive():
                self.reader_thread.start()

    def killReader(self):
        self.fac.pauseInventory()
        self.fac.politeShutdown()
        reactor.callFromThread(reactor.stop)

    def pauseInventory(self):
        if self.isConnected:
            self.fac.politeShutdown()
            self.isConnected = False
            eel.createAlert("info", "Inventory stopped", "Stopped accepting tags from the reader", "cable")
        else:
            eel.createAlert("error", "Inventory has not started", "Cannot stop an inventory that has not started", "cable")
    
    def getAlive(self):
        return self.reader_thread.is_alive()

    def changeFilters(self, whitelist, blacklist):
        self.whitelist = whitelist
        self.blacklist = blacklist



global reader
reader = RFIDReader()


@eel.expose
def GUIStartInventory(host, port=LLRP_PORT, antennas=[1], tari=7140, tx_power=0, mode_identifier=0):
    if (host):
        print("Attempting to start inventory with host: " + host)
        reader.startInventory(host, port, antennas, tari, tx_power, mode_identifier)
        if (not reader.getAlive()):
            print("Failed to start inventory")
            return False
        return True
    else:
        eel.createAlert("error", "No host specified", "Set a host before starting an inventory", "cable")
        return False


@eel.expose
def GUIPauseInventory():
    reader.pauseInventory()

@eel.expose
def changeFilters(whitelist, blacklist):
    reader.changeFilters(whitelist, blacklist)


# GUIStartInventory('speedway-00-05-56.local')

def test():
    print("Hello")


eel.init('public')
eel.start({"port": 3000}, host="localhost", port=8888)