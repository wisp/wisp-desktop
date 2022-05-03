from tracemalloc import start
from sllurp.llrp import LLRP_PORT, LLRPClientFactory
from twisted.internet import reactor
import gevent.monkey
# gevent.monkey.patch_all()
import threading
import eel
import queue
import time
from logging import getLogger, INFO, Formatter, StreamHandler, WARN

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
logger = getLogger('sllurp')

def setup_logging():
    logger.setLevel(10)
    logFormat = '%(asctime)s %(name)s: %(levelname)s: %(message)s'
    formatter = Formatter(logFormat)
    handler = StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)

class RFIDReader:

    def __init__(self):
        def startThread(args):
            reactor.run(args)
            return

        reactor.addSystemEventTrigger(
            'before', 'shutdown', reactor.callFromThread, reactor.stop)
        self.reader_thread = threading.Thread(
            target=startThread, args=(False,))

        self.tagQueue = queue.Queue()

    def tagSeen(self, tagReport):
        try:
            tags = tagReport.__dict__.get('msgdict').get(
                'RO_ACCESS_REPORT').get('TagReportData')

            for tag in tags:
                # The EPC is currently bytes, and eel doesn't like it when
                # bytes are passed to the JS, so we need to convert to a
                # string first.
                tag['EPC-96'] = str(tag['EPC-96'], 'utf-8')
                print(tag)
                eel.acceptTag(tag)

        except:
            pass

    def startInventory(self):
        # start the inventory
        self.fac.start_first = True

    def connect(self, host, port):
        self.fac = LLRPClientFactory(start_inventory=False,
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

        reactor.callFromThread(reactor.connectTCP, host,
                               port, self.fac, timeout=3)

        if not self.getAlive():
            self.reader_thread.start()

    def setReaderSettings(self, antennas, tari, tx_power, mode_identifier):
        self.fac.set_reader_config = {
            'AntennaConfiguration': {
                'AntennaID': antennas,
            },
            'ReaderMode': {
                'ModeIdentifier': mode_identifier,
                'TagPopulation': {
                    'TagReportContentSelector': {
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
                    }
                }
            }
        }
        # self.fac.client_args['antennas'] = antennas
        # self.fac.client_args['tari'] = tari
        # self.fac.client_args['tx_power'] = tx_power
        # self.fac.client_args['mode_identifier'] = mode_identifier

        # self.fac = LLRPClientFactory(report_every_n_tags=1,
        #                              antennas=antennas,
        #                              tx_power=tx_power,
        #                              start_inventory=False,
        #                              mode_identifier=mode_identifier,
        #                              tari=tari,
        #                              tag_content_selector={
        #                                  'EnableROSpecID': True,
        #                                  'EnableSpecIndex': True,
        #                                  'EnableInventoryParameterSpecID': True,
        #                                  'EnableAntennaID': True,
        #                                  'EnableChannelIndex': True,
        #                                  'EnablePeakRSSI': True,
        #                                  'EnableFirstSeenTimestamp': True,
        #                                  'EnableLastSeenTimestamp': True,
        #                                  'EnableTagSeenCount': True,
        #                                  'EnableAccessSpecID': True,
        #                              })

    def killReader(self):
        self.fac.pauseInventory()
        self.fac.politeShutdown()
        reactor.callFromThread(reactor.stop)

    def pauseInventory(self):
        self.fac.pauseInventory()

    def getAlive(self):
        return self.reader_thread.is_alive()


global reader
reader = RFIDReader()


@ eel.expose
def GUIStartInventory():
    reader.startInventory()


@ eel.expose
def GUIConnect(host, port):
    reader.connect(host, port)


@eel.expose
def GUISetReaderSettings(params=[[1], 7140, 0, 0]):
    reader.setReaderSettings(*params)


@ eel.expose
def GUIPauseInventory():
    reader.pauseInventory()

setup_logging()

# eel.init('static')
# eel.start('index.html')

print('GUI connect')
GUIConnect('speedway-00-05-56.local', LLRP_PORT)
time.sleep(1)
# print('GUI set reader settings')
# GUISetReaderSettings()
# time.sleep(1)
print('GUI start inventory')
GUIStartInventory()
