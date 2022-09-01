import { useEffect, useState, useRef, createContext, useContext, useCallback } from 'react'
import { useAlert } from 'react-alert'
import { Connection } from './ConnectionContext';
import _ from 'lodash'

const TagData = createContext([]);
const TagDataRecent = createContext([]);
const TagDataModifiers = createContext([]);
const ReaderLogs = createContext("");

const maxUpdateInterval = 100;

const EelListener = (props) => {
    const alert = useAlert();
    const forceState = useContext(Connection).connectionFunctions.forceState;

    const [tagData, _setTagData] = useState([])
    const tagDataRef = useRef(tagData);
    const throttledTagDataUpdate = _.throttle(() => _setTagData(tagDataRef.current), maxUpdateInterval)
    const setTagData = data => {
        tagDataRef.current = data
        throttledTagDataUpdate()
    }

    const [tagDataRecent, _setTagDataRecent] = useState({})
    const tagDataRecentRef = useRef(tagDataRecent);
    const throttledTagDataRecentUpdate = _.throttle(() => _setTagDataRecent(tagDataRecentRef.current), maxUpdateInterval)
    const setTagDataRecent = data => {
        tagDataRecentRef.current = data
        throttledTagDataRecentUpdate()
    }

    const [readerLogs, _setReaderLogs] = useState([]);
    const readerLogsRef = useRef(readerLogs);
    const setReaderLogs = data => {
        readerLogsRef.current = data
        _setReaderLogs(data)
    }

    const [temporarilyPaused, _setTemporarilyPaused] = useState(false);
    const temporarilyPausedRef = useRef(temporarilyPaused);
    const setTemporarilyPaused = data => {
        temporarilyPausedRef.current = data
        _setTemporarilyPaused(data)
    }

    function createAlert(type, title, message, icon = "info") {
        alert.show(message, { title: title, timeout: 3000, type: type, icon: icon });
    }

    function acceptTag(tagData) {
        addTag(tagData)
    }

    function readerLog(message) {
        setReaderLogs([...readerLogsRef.current, message]);
    }

    function locationOf(element, array, comparer, start, end) {
        if (array.length === 0)
            return 0;
    
        start = start || 0;
        end = end || array.length;
        var pivot = (start + end) >> 1;  // should be faster than dividing by 2
    
        var c = comparer(element, array[pivot]);
        if (end - start <= 1) return c == -1 ? pivot : pivot + 1;
    
        switch (c) {
            case -1: return locationOf(element, array, comparer, start, pivot);
            case 0: return pivot;
            case 1: return locationOf(element, array, comparer, pivot, end);
        };
    };
    
    // sample for objects like {lastName: 'Miller', ...}
    var timestampCompare = function (a, b) {
        if (a.seen < b.seen) return -1;
        if (a.seen > b.seen) return 1;
        return 0;
    };
    
    function addTag(tag) {
        if (!temporarilyPausedRef.current) {
            tag.seenUI = new Date().getTime() / 1000;
            const index = locationOf(tag, tagDataRef.current, timestampCompare);
            setTagData([...tagDataRef.current.slice(0, index), tag, ...tagDataRef.current.slice(index)]);

            const prev = tagDataRecentRef.current[tag['wispId']];
            if (prev) {
                tag.count = prev.count + 1;
            } else {
                tag.count = 1;
            }
            setTagDataRecent({ ...tagDataRecentRef.current, [tag['wispId']]: tag });


            // // If the tag was read more than 250 ms ago, it means we're running very behind, so we need to pause the inventory
            // const delayTime = new Date().getTime() - tag.seen * 1000;
            // // console.log("running " + delayTime + "ms behind");
            // if (delayTime > 250) {
            //     pauseInventory(1000);
            // }
        }
    }

    function pauseInventory(time) {
        alert.show("Tags arrived too quickly for the UI to update. Tag reads were probably lost.", { title: "Inventory had to pause", timeout: 3000, type: 'error', icon: 'hourglass_top' });
        setTemporarilyPaused(true);
        setTimeout(() => {
            setTemporarilyPaused(false);
        }, time);
    }

    function forceStateUpdate(isConnected, isInventorying) {
        // forceState({ isConnected, isInventorying });
    }

    function closeGUI() {
        window.onbeforeunload = null;
        window.close();
    }

    useEffect(() => {
        window.eel.expose(acceptTag, 'acceptTag');
        window.eel.expose(createAlert, 'createAlert');
        window.eel.expose(readerLog, 'readerLog');
        window.eel.expose(closeGUI, 'closeGUI');
    }, []);

    return (
        <TagData.Provider value={{ data: tagData }}>
            <TagDataRecent.Provider value={{ data: tagDataRecent }}>
                <ReaderLogs.Provider value={{ logs: readerLogs }}>
                    <TagDataModifiers.Provider value={[setTagData, setTagDataRecent]} >
                        {props.children}
                    </TagDataModifiers.Provider>
                </ReaderLogs.Provider>
            </TagDataRecent.Provider>
        </TagData.Provider>
    );
}

export { EelListener, TagData, TagDataRecent, TagDataModifiers, ReaderLogs };