from socket import socket, timeout
from sllurp.llrp import (C1G2Read, C1G2Write, LLRPReaderClient,
                         LLRPReaderConfig, LLRPReaderState, llrp_data2xml)
import logging
import flask
from flask_socketio import SocketIO, emit
import threading
import time




# Class to catch the logs from the reader and pass them to the front end
class SllurpLoggingHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record, level=None):
        level = record.levelno
        
        if level == logging.INFO:
            sev = "info"
        elif level == logging.WARNING:
            sev = "warn"
        else:
            sev = "error"

        msg = record.getMessage()
        title = sev
        if len(record.getMessage().split(": ")) > 1:
            title = record.getMessage().split(": ")[0]
            msg = record.getMessage().split(": ")[1]

        # Warnings and errors are sent as alerts
        # if (sev != "info"):
        #     # eel.createAlert(sev, title, msg)
        #     print(sev, title, msg)

        # All other logs are sent as logs
        # eel.readerLog(record.getMessage())
        print(sev, title, msg)

sllurp_logger = logging.getLogger('sllurp')
sllurp_logger.setLevel(logging.INFO)
sllurp_logger.addHandler(SllurpLoggingHandler())


# app = flask.Flask(__name__)
# socketio = SocketIO(app)

# if __name__ == '__main__':
#     socketio.run(app)app = flask.Flask(__name__)
# socketio = SocketIO(app)

# if __name__ == '__main__':
#     socketio.run(app)

# # Connection and disconnection events
# @socketio.on('connect')
# def test_connect():
#     # emit('my response', {'data': 'Connected'})
#     print("Client connected")

# @socketio.on('disconnect')
# def test_disconnect():
#     print('Client disconnected')

# # Sllurp connection events
# @socketio.on('reader_connect')
# def reader_connect(options):
#     print("Connecting to reader", options)

# def reader_disconnect():
#     print("Reader disconnected")

# def inventory_start():
#     print("Inventory started")

# def inventory_stop():
#     print("Inventory stopped")
# def test_disconnect():
#     print('Client disconnected')

# # Sllurp connection events
# @socketio.on('reader_connect')
# def reader_connect(options):
#     print("Connecting to reader", options)

# def reader_disconnect():
#     print("Reader disconnected")

# def inventory_start():
#     print("Inventory started")

# def inventory_stop():
#     print("Inventory stopped")


# class SllurpReader:
#     def __init__(self):
#         self.is_connected = False
#         self.inventory_started = False
#         self.thread_started = False
#         self.reader_thread = None

#     def start_thread(self):
#         self.reader_thread = threading.Thread(target=self._reader_thread_func, args=(False,))
#         self.reader_thread.start()
#         self.thread_started = True

#     def _reader_thread_func(self):
#         reactor.run(False)
#         return

#     def connect(self, host, port):
#         reactor.callFromThread(reactor.connectTCP(host, port, LLRPClientFactory(self)))
#         self.is_connected = True

def tag_report_callback(msg):
    print("Tag report:", msg)

# def state_callback(msg):
#     print("State:", msg)

# # fac.addStateCallback('info', state_callback)
# # print (fac.getProtocolStates())
# reactor.connectTCP('speedway-00-05-56.local', LLRP_PORT, fac, timeout=1)
# fac.addTagReportCallback(tag_report_callback)
# fac.client_args['start_inventory'] = False
# print (fac.getProtocolStates())
# reactor.run()
# print("Reader thread stopped")

fac_args = dict(
    report_every_n_tags=1,
    antennas=[1],
    tx_power=0,
    tari=7140,
    mode_identifier=0,
    # tag_population=tag_population,
    # tag_filter_mask=tag_filter_mask,
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

host = 'speedway-00-05-56.local'
port = 5084

config = LLRPReaderConfig(fac_args)
reader = LLRPReaderClient(host, port, config)
reader.add_tag_report_callback(tag_report_callback)
reader.connect()

# fac_args['start_inventory'] = True
# reader.update_config(LLRPReaderConfig(fac_args))
            # update internal variable
# reader.llrp.parseCapabilities(reader.llrp.capabilities)
print("waiting")
time.sleep(5)

# fac_args['start_inventory'] = True
# reader.update_config(LLRPReaderConfig(fac_args))
reader.llrp.startInventory(force_regen_rospec=False)

time.sleep(10)

# @socketio.on('connect')
reader.llrp.stopPolitely()
# reader.join(0.1)
time.sleep(1)
print("changing config")
fac_args['mode_identifier'] = 2
reader.update_config(LLRPReaderConfig(fac_args))
reader.llrp.startInventory(force_regen_rospec=False)