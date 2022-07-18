from sllurp.llrp import LLRPReaderClient, LLRPReaderConfig, LLRPReaderState, C1G2Read, C1G2Write

fac_args = dict(
    report_every_n_tags=1,
    mode_identifier=0,
    antennas=[1],
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

# readSpecParam = dict ({
#     'OpSpecID': 0,
#     'MB': 0,
#     'WordPtr': 0,
#     'AccessPassword': 0,
#     'WordCount': 15,
# })
opSpec = C1G2Read(OpSpecID=0, AccessPassword=0, MB=0, WordPtr=0, WordCount=15)

def tag_seen(reader, tags):
    print(tags)


config = LLRPReaderConfig(fac_args)
reader = LLRPReaderClient('speedway-00-05-56.local', 5084, config)
reader.add_tag_report_callback(tag_seen)
reader.connect()
reader.llrp.startAccess(opSpec)