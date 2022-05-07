from sllurp.llrp import LLRP_PORT, LLRPClientFactory
from twisted.internet import reactor
import threading
import eel
import queue
import logging
import time

# <RO_ACCESS_REPORT>
#         <Ver>1</Ver>
#         <Type>61</Type>
#         <ID>1881190295</ID>
#         <TagReportData>
#                 <EPC-96>b'0b0000000000000000515746'</EPC-96>
#                 <ROSpecID>(1,)</ROSpecID>
#                 <SpecIndex>(1,)</SpecIndex>
#                 <InventoryParameterSpecID>(1,)</InventoryParameterSpecID>
#                 <AntennaID>(1,)</AntennaID>
#                 <PeakRSSI>(-24,)</PeakRSSI>
#                 <ChannelIndex>(32,)</ChannelIndex>
#                 <FirstSeenTimestampUTC>(1074853693357558,)</FirstSeenTimestampUTC>
#                 <LastSeenTimestampUTC>(1074853693357558,)</LastSeenTimestampUTC>
#                 <TagSeenCount>(1,)</TagSeenCount>
#                 <AccessSpecID>(0,)</AccessSpecID>
#         </TagReportData>
# </RO_ACCESS_REPORT>

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

        eel.createAlert(sev, title, msg)


sllurp_logger = logging.getLogger('sllurp')
sllurp_logger.setLevel(logging.WARN)
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
                epc = str(tag['EPC-96'], 'utf-8').upper()
                newTag['epc'] = epc
                newTag['wispType'] = epc[0:2]
                newTag['wispData'] = epc[2:18]
                newTag['wispHwRev'] = epc[18:20]
                newTag['wispId'] = epc[20:24]
                newTag['rssi'] = tag['PeakRSSI'][0]
                newTag['seen'] = time.time()
                
                self.count += 1
                print(self.count)
                eel.acceptTag(newTag)

        except Exception as e:
            print(e)
            pass


    def startInventory(self, host, port, antennas, tari, tx_power, mode_identifier):
        if self.isConnected:
            eel.createAlert("error", "Inventory already started", "Stop the inventory before starting a new one")
        else:
            eel.createAlert("success", "Inventory started", "Accepting tags from the reader")
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
            eel.createAlert("info", "Inventory stopped", "Stopped accepting tags from the reader")
        else:
            eel.createAlert("error", "Inventory has not started", "Cannot stop an inventory that has not started")
    
    def getAlive(self):
        return self.reader_thread.is_alive()


global reader
reader = RFIDReader()


@eel.expose
def GUIStartInventory(host, port=LLRP_PORT, antennas=[1], tari=7140, tx_power=0, mode_identifier=0):
    if (host):
        print("Attempting to start inventory with host: " + host)
        reader.startInventory(host, port, antennas, tari, tx_power, mode_identifier)
        if (not reader.isConnected):
            return False
        return True
    else:
        eel.createAlert("error", "No host specified", "Set a host before starting an inventory")
        return False


@eel.expose
def GUIPauseInventory():
        reader.pauseInventory()

@eel.expose
def printSomething():
    print("Hello")


# GUIStartInventory('speedway-00-05-56.local')

def test():
    print("Hello")


eel.init('public')
eel.start({"port": 3000}, host="localhost", port=8888)