from sllurp.llrp import LLRPReaderClient, LLRPReaderConfig, LLRPReaderState
import eel
import logging
import time
import atexit
import tagDict
import sys
from queue import Queue
from threading import Thread

class SllurpHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record, level=None):
        # level = record.levelno
        
        # if level == logging.INFO:
        #     sev = "info"
        # elif level == logging.WARNING:
        #     sev = "error"
        # else:
        #     sev = "error"

        # msg = record.getMessage()
        # title = sev
        # if len(record.getMessage().split(": ")) > 1:
        #     title = record.getMessage().split(": ")[0]
        #     msg = record.getMessage().split(": ")[1]

        eel.readerLog(record.getMessage())
        # print(record.getMessage())


sllurp_logger = logging.getLogger('sllurp')
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

        self.fac_args = dict()
        self.resetReaderConfig()
        
        self.isKilled = False
        self.tagQueue = Queue(maxsize=1000)
        self.tagThread = Thread(target=self.process_tags, args=(self.tagQueue, self.isKilled,))
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
        self.reader.add_state_callback(LLRPReaderState.STATE_CONNECTED, self.onConnect)
        self.reader.add_disconnected_callback(self.onDisconnect)
        self.reader.add_state_callback(LLRPReaderState.STATE_INVENTORYING, self.onInventory)
        
        try: 
            print("Connecting to reader...")
            self.reader.connect()
        except Exception as e:
            print("Connection failed: " + str(e))
            return False

        timer = 0
        while(not self.isConnected or timer > 40):
            timer += 1
            time.sleep(0.1)

        if (self.isConnected):
            print("Reader connected")
            time.sleep(2.25)  # Unfortunately, this is necessary to get the reader to start inventorying properly
                              # Don't know why just yet.
            return True
        
        print("Reader connection timed out")
        return False

    def disconnect(self):
        print("Running reader.disconnect")
        if not self.isConnected:
            print("Reader already disconnected")
            return False

        try: 
            self.reader.disconnect(timeout=None)
            self.reader.join(0.1)
            time.sleep(0.5) # This is also necessary to get the reader to disconnect properly
            return True
        except Exception as e:
            print("Disconnection failed: " + str(e))
            return False

    def startInventory(self):
        print("Running reader.startInventory")
        if self.isConnected:
            if not self.isInventoryRunning:
                try:
                    self.reader.llrp.update_config(LLRPReaderConfig(self.fac_args))
                    try:
                        self.reader.llrp.parseCapabilities(self.reader.llrp.capabilities)
                    except:
                        print("Failed to parse capabilities")
                        return False
                    self.reader.llrp.startInventory(force_regen_rospec=True)
                    timer = 0
                    while(not self.isInventoryRunning or timer > 40):
                        timer += 1
                        time.sleep(0.1)

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

    def changeConfig(self, antennas, tx_power, mode_identifier):
        self.fac_args["antennas"] = antennas
        self.fac_args["tx_power"] = tx_power
        self.fac_args["mode_identifier"] = mode_identifier
        # self.fac_config.update_config(dict(
        #     antennas=antennas,
        #     tx_power=tx_power,
        #     # mode_identifier=mode_identifier,
        #     **self.FAC_ARGS_DEFAULT
        # ))
        return True

    def kill_all(self):
        self.isKilled = True
        self.tagThread.join()
        self.stopInventory()
        time.sleep(0.1)
        self.disconnect()

    def tag_seen(self, reader, tags):
        self.tagQueue.put(*tags)

    def process_tags(self, queue, isKilled):
        while(not isKilled):
            if queue.full():
                print("The tag processing queue is full")

            try:
                tag = queue.get()
                newTag = {}
                epc = str(tag['EPC-96'], 'utf-8').upper()
                newTag['wispId'] = epc[20:24]
                
                if ((not self.whitelist or newTag['wispId'] in self.whitelist) and newTag['wispId'] not in self.blacklist):
                    
                    newTag['seen'] = time.time()
                    newTag['epc'] = epc
                    newTag['wispType'] = epc[0:2]
                    newTag['wispData'] = epc[2:20]
                    # newTag['wispHwRev'] = epc[18:20]
                    newTag['rssi'] = tag['PeakRSSI']
                    # Here we create formatted versions of the data. A
                    # string version that can be rendered as text and an
                    # object version that has the data, units and a label.

                    # The formatter depends on the type of tag, so check
                    # tags.py for the different types.
                    tagTools = tagDict.defs.get(newTag['wispType'])
                    if tagTools:
                        newTag['formattedString'] = tagTools.get('parserString')(newTag['wispData'])
                        newTag['formatted'] = tagTools.get('parser')(newTag['wispData'])

                    eel.acceptTag(newTag)
                    # self.count += 1
                    

            except Exception as e:
                print("Failed to parse tag: " + str(e))
                return False
        return


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
    rfid.changeConfig(antennas, tx_power, mode_identifier)
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


def onScriptClose():
    eel.closeGUI()
    rfid.kill_all()

atexit.register(onScriptClose)

def onGUIClose(a,b):
    print("GUI closed... killing")
    rfid.kill_all()
    sys.exit()

if __name__ == "__main__":
    if (len(sys.argv) > 1 and sys.argv[1] == "--dev"):
        # Development
        print("Running in development mode:")
        print("Expects the development version of react to be running on port 3000")
        print("It can be started with `npm start`")
        eel.init('../react/public')
        eel.start({'port': 3000}, host="localhost", port=8888, close_callback=onGUIClose, cmdline_args=["--disable-background-mode", "--disable-web-security", "--disable-translate", "--enable-kiosk-mode"])
    else:
        # Production
        print("Running in production mode:")
        eel.init('web')
        eel.start("index.html", host="localhost", port=3467, size=(1200, 800), close_callback=onGUIClose, cmdline_args=["--disable-background-mode", "--disable-web-security", "--disable-translate", "--enable-kiosk-mode"])