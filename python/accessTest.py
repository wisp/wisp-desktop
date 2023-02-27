from sllurp_copy.sllurp.llrp import LLRPReaderClient, LLRPReaderConfig, LLRPReaderState, C1G2Write
import logging
logging.getLogger('sllurp').setLevel(logging.DEBUG)

def tag_seen(tag):
    print(tag)


# Initialize reader
config = LLRPReaderConfig(dict(
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
))
reader = LLRPReaderClient('192.168.1.25', 5084, config)
reader.add_tag_report_callback(tag_seen)

reader.connect()

opSpec = C1G2Write({
    'OpSpecID': 0,
    'MB': 3,
    'WordPtr': 0,
    'AccessPassword': 0,
    'WriteDataWordCount': 2,
    'WriteData': '\x01\x01'
})

reader.start_access_spec(opSpec, None, stop_after_count=1)
