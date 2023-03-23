from sllurp_copy.sllurp.llrp import LLRPReaderClient, LLRPReaderConfig, LLRPReaderState
import eel

import logging
import time
import atexit
import sys
import os
import socket
from queue import Queue
from threading import Thread, Timer

import tagDict

class SllurpHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record, level=None):
        # Send all reader logs to the built-in terminal
        eel.readerLog(record.getMessage())

        # If it's a warning or error, send it as an alert
        if record.levelno > logging.INFO:
            if record.levelno == logging.WARNING:
                sev = "Warning"
            else:
                sev = "Error"

            msg = record.getMessage()
            title = sev + " from reader"
            eel.createAlert('error', title, msg, sev.lower())


sllurp_logger = logging.getLogger('sllurp_copy')
sllurp_logger.setLevel(logging.DEBUG)
sllurp_logger.addHandler(SllurpHandler())


class RFIDReader:

    def __init__(self):
        self.isConnected = False
        self.isInventoryRunning = False
        self.reader = None
        self.whitelist = []
        self.blacklist = []

        self.FAC_ARGS_DEFAULT = dict(
            report_every_n_tags=1,
            start_inventory=False,
            impinj_search_mode=2,
            tag_content_selector={
                "EnableROSpecID": False,
                "EnableSpecIndex": False,
                "EnableInventoryParameterSpecID": False,
                "EnableAntennaID": True,
                "EnableChannelIndex": True,
                "EnablePeakRSSI": True,
                "EnableFirstSeenTimestamp": True,
                "EnableLastSeenTimestamp": True,
                "EnableTagSeenCount": True,
                "EnableAccessSpecID": True,
            },
            event_selector={
                'HoppingEvent': False,
                'GPIEvent': False,
                'ROSpecEvent': True,
                'ReportBufferFillWarning': True,
                'ReaderExceptionEvent': True,
                'RFSurveyEvent': False,
                'AISpecEvent': True,
                'AISpecEventWithSingulation': False,
                'AntennaEvent': False,
            },
        )

        self.timeOffset = None
        self.multiMode = False

        self.fac_args = dict()
        self.resetReaderConfig()

        self.isKilled = False
        self.tagQueue = Queue(maxsize=10000)
        self.tagThread = Thread(target=self.process_tags,
                                args=(self.tagQueue,))
        self.tagThread.daemon = True
        self.tagThread.start()

    def forceFrontendUpdate(self):
        # TODO: Not implemented yet
        # An unexpected disconnection will cause the frontend to lose
        # step with the backend and reader, requiring an app restart.

        # eel.forceStateUpdate(self.isConnected, self.isInventoryRunning)
        return True

    def resetReaderConfig(self):
        self.fac_args = self.FAC_ARGS_DEFAULT.copy()

    def onConnect(self, reader, state):
        print("Received connect event from reader")
        self.isConnected = True
        self.forceFrontendUpdate()

    def onDisconnect(self, state):
        print("Received disconnect event from reader")
        self.isConnected = False
        self.isInventoryRunning = False
        self.forceFrontendUpdate()
        print("Reader disconnected!!")

    def onInventory(self, reader, state):
        print("Received inventory event from reader")
        self.isInventoryRunning = True
        self.forceFrontendUpdate()

    def eventCallback(self, events):
        exception_event = events.get('ReaderExceptionEvent', {})
        if exception_event:
            print("Reader exception: " + str(exception_event))
            return

    def connect(self, host, port):
        print("Running reader.connect")
        self.resetReaderConfig()
        config = LLRPReaderConfig(self.fac_args)
        self.reader = LLRPReaderClient(host, port, config)

        self.reader.add_tag_report_callback(self.tag_seen)
        self.reader.add_state_callback(
            LLRPReaderState.STATE_CONNECTED, self.onConnect)
        self.reader.add_disconnected_callback(self.onDisconnect)
        self.reader.add_state_callback(
            LLRPReaderState.STATE_INVENTORYING, self.onInventory)

        try:
            print("Connecting to reader...")
            self.reader.connect()
        except Exception as e:
            print("Connection failed: " + str(e))
            return False

        timer = 0
        while (not self.isConnected or timer > 40):
            timer += 1
            eel.sleep(0.1)

        if (self.isConnected):
            print("Reader connected")
            # Unfortunately, this is necessary to get the reader to start inventorying properly
            eel.sleep(2.25)
            # Don't know why just yet.
            return True

        print("Reader connection timed out")
        return False

    def disconnect(self):
        print("Running reader.disconnect")
        if not self.isConnected:
            print("Reader already disconnected")
            return True
        try:
            self.reader.disconnect(timeout=None)
            self.reader.join(0.1)
            # This is also necessary to get the reader to disconnect properly
            eel.sleep(0.5)
            return True
        except Exception as e:
            print("Disconnection failed: " + str(e))
            return True

    def startInventory(self):
        print("Running reader.startInventory")
        if self.isConnected:
            if not self.isInventoryRunning:
                try:
                    self.timeOffset = None  # Reset the time offset
                    self.reader.llrp.update_config(
                        LLRPReaderConfig(self.fac_args))
                    try:
                        self.reader.llrp.parseCapabilities(
                            self.reader.llrp.capabilities)
                    except:
                        print("Failed to parse capabilities")
                        return False
                    self.reader.llrp.startInventory(force_regen_rospec=True)
                    timer = 0
                    while (not self.isInventoryRunning or timer > 40):
                        timer += 1
                        eel.sleep(0.1)

                    if (self.isInventoryRunning):
                        print("Inventory started")
                        return True

                    print("Failed to start inventory")
                    return False
                except Exception as e:
                    print("Failed to start inventory: " + str(e))
                    return False
            else:
                print("Inventory already running")
        else:
            print("Reader not connected")
        return False

    def startAccess(self):
        print("Running reader.startAccess")
        self.reader.llrp.startAccess()

    def stopInventory(self):
        if self.isConnected:
            if self.isInventoryRunning:
                try:
                    self.reader.llrp.stopAllROSpecs()
                    self.isInventoryRunning = False
                    return True
                except Exception as e:
                    print("Failed to stop inventory: " + str(e))
                    return False
            else:
                print("Inventory already stopped")
        else:
            print("Reader not connected")
        return False

    def changeFilters(self, whitelist, blacklist):
        self.whitelist = whitelist
        self.blacklist = blacklist
        return True

    def changeConfig(self, antennas, tx_power, mode_identifier, multi_mode=False):
        if multi_mode:
            self.fac_args["mode_identifier"] = 0
            self.fac_args["report_every_n_tags"] = 200
            self.multiMode = True
        else:
            self.fac_args["mode_identifier"] = mode_identifier
            self.fac_args["report_every_n_tags"] = 1
            self.multiMode = False

        self.fac_args["antennas"] = antennas
        self.fac_args["tx_power"] = tx_power

        return True

    def kill_all(self):
        self.isKilled = True
        self.tagThread.join()
        self.disconnect()

    def tag_seen(self, reader, tags):
        self.tagQueue.put_nowait(tags)

    def process_tags(self, queue):
        while (not self.isKilled):
            if (not queue.empty()):
                receivedTags = queue.get()
                reversedTags = receivedTags[::-1]

                for tag in reversedTags:
                    try:                    
                        newTag = {}
                        if type(tag['EPC']) is not str:
                            epc = str(tag['EPC'], 'utf-8').upper()
                        else:
                            epc = tag['EPC'].upper()
                        newTag['wispId'] = epc[20:24]
                        newTag['wispType'] = epc[0:2]
                        newTag['wispHwRev'] = epc[18:20]

                        # Special cases for multi-tags
                        if (newTag['wispType'] == 'CA' or newTag['wispType'] == 'C1'):
                            newTag['wispId'] = 'CA00'
                            # newTag['wispId'] = 'CA' + epc[22:24]
                            newTag['wispHwRev'] = 'NA'
                        if (newTag['wispType'] == 'AD'):
                            newTag['wispId'] = 'AD00'
                            # newTag['wispId'] = 'AD' + epc[22:24]
                            newTag['wispHwRev'] = 'NA'

                        def check_list(wispId, checkList):
                            for listItem in checkList:
                                listItemChars = list(listItem)
                                wispIdChars = list(wispId)
                                for i in range(4):
                                    if (listItemChars[i] == 'X' or listItemChars[i] == wispIdChars[i]):
                                        if (i == 3):
                                            return True
                                    else:
                                        break
                            return False

                        if ((not self.whitelist or check_list(newTag['wispId'], self.whitelist)) and (not check_list(newTag['wispId'], self.blacklist))):

                            if self.timeOffset is None:
                                self.timeOffset = time.time(
                                ) - tag['LastSeenTimestampUTC'] / 1000000

                            newTag['seen'] = tag['LastSeenTimestampUTC'] / \
                                1000000 + self.timeOffset

                            newTag['seenPy'] = time.time()

                            newTag['epc'] = epc
                            newTag['wispData'] = epc[2:20]
                            newTag['rssi'] = tag['PeakRSSI']

                            # Here we create formatted versions of the data. A
                            # string version that can be rendered as text and an
                            # object version that has the data, units and a label.

                            # The formatter depends on the type of tag, so check
                            # tags.py for the different types.
                            try:
                                tagTools = tagDict.defs.get(newTag['wispType'])
                                if tagTools:
                                    newTag["formattedType"] = tagTools.get('name')
                                    newTag['formatted'] = tagTools.get(
                                        'parser')(epc)

                                    # Optionally add the human readable string of
                                    # the data
                                    if 'parserString' in tagTools:
                                        newTag['formattedString'] = tagTools.get(
                                            'parserString')(newTag['formatted'])
                            except Exception as e:
                                print("Failed to use formatter:", e)
                            
                            try:
                                eel.acceptTag(newTag)
                            except:
                                eel.sleep(0.01)
                                pass

                    except Exception as e:
                        print("Failed to parse tag:", e)
                        pass

        print("Tag processing thread killed")
        os._exit(0)

if __name__ == "__main__":

    rfid = RFIDReader()


    @eel.expose
    def connect(host, port):
        print("Eel connecting")
        return rfid.connect(host, port)


    @eel.expose
    def disconnect():
        print("Eel disconnecting")
        return rfid.disconnect()


    @eel.expose
    def startInventory(antennas, tx_power, mode_identifier):
        print("Eel starting inventory")
        rfid.changeConfig(antennas, tx_power, mode_identifier, multi_mode=(
            mode_identifier == 10 or mode_identifier == 11))
        return rfid.startInventory()


    @eel.expose
    def stopInventory():
        print("Eel stopping inventory")
        return rfid.stopInventory()


    @eel.expose
    def changeFilters(whitelist, blacklist):
        print("Eel updating filters")
        rfid.changeFilters(whitelist, blacklist)
        return True

    watchdog = None
    @eel.expose
    def alive():
        global watchdog
        watchdog = time.time()

    def onScriptClose():
        eel.closeGUI()
        rfid.kill_all()


    atexit.register(onScriptClose)


    def onGUIClose(a, b):
        print("GUI closed... killing")
        rfid.kill_all()
        os._exit(1)

    if (len(sys.argv) > 1 and sys.argv[1] == "--dev"):
        # Development
        print("Running in development mode:")
        print("Expects the development version of react to be running on port 3000")
        print("It can be started with `npm start`")
        eel.init('../react/public')
        eel.start({'port': 3000}, host="localhost", port=3467, close_callback=onGUIClose, shutdown_delay=5, cmdline_args=[
                  "--disable-background-mode", "--disable-web-security", "--disable-translate", "--enable-kiosk-mode"])
    else:
        # Production
        print("Running in production mode:")
        eel.init('web')  # Give folder containing web files
        # Check if port 3467 is available
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("localhost", 3467))
            s.close()
        except socket.error as e:
            print("Port 3467 is already in use. This is likely because the app did not close properly the last time it was run.")
            print("Please close the app and try again.")
            raise Exception(
                "The app is still running in the background. Wait a moment and the app should close itself.")

        eel.start("index.html", host="localhost", port=3467, block=False, close_callback=onGUIClose, shutdown_delay=5, cmdline_args=[
                  "--disable-web-security", "--disable-translate", "--enable-kiosk-mode"])
        # Ensure we are receiving is_alive messages from the GUI
        # watchdog = time.time() + 20 # Give the GUI 15 seconds to start
        while True:
            if ((watchdog is not None) and (time.time() - watchdog > 25)):
                print("GUI is not responding... killing")
                eel.closeGUI()
                rfid.kill_all()
                os._exit(1)
            eel.sleep(1)
