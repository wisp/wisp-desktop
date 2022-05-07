import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { useAlert } from 'react-alert'
import { Connection } from './ConnectionContext';

const TagData = createContext([]);
const TagDataRecent = createContext([]);

const EelListener = (props) => {

    const [connection, setConnection] = useContext(Connection);

    const alert = useAlert();
    const [tagData, _setTagData] = useState([])
    const tagDataRef = useRef(tagData);
    const setTagData = data => {
        tagDataRef.current = data
        _setTagData(data)
    }

    const [tagDataRecent, _setTagDataRecent] = useState([])
    const tagDataRecentRef = useRef(tagDataRecent);
    const setTagDataRecent = data => {
        tagDataRecentRef.current = data
        _setTagDataRecent(data)
    }

    useEffect(() => {
        // Handle alerts that come from the Python side and display them in the UI
        const alertListener = document.addEventListener('alertEvent', (e) => {
            alert.show(e.detail.message, { title: e.detail.title, timeout: 3000, type: e.detail.type, icon: e.detail.icon });
        })

        // Handle each new tag that comes in. This is where we will filter incoming tags
        const tagListener = document.addEventListener('newTagEvent', (e) => {
            // If the whitelist has any entries, add only those tags to the tagData array
            if (connection.filters.whitelist.length > 0) {
                if (connection.filters.whitelist.includes(e.detail.wispId)) {
                    addTag(e.detail);
                }
            } else if (connection.filters.blacklist.length > 0) {
                if (!connection.filters.blacklist.includes(e.detail.wispId)) {
                    addTag(e.detail);
                }
            } else {
                addTag(e.detail);
            }
        })

        function addTag(tag) {
            setTagData([...tagDataRef.current, tag]);
            const index = tagDataRecentRef.current.findIndex(t => t['wispId'] == tag['wispId']);
            if (index != -1) {
                const prevTag = tagDataRecentRef.current[index];
                tag.count = prevTag.count + 1;
                setTagDataRecent([...tagDataRecentRef.current.slice(0, index), tag, ...tagDataRecentRef.current.slice(index + 1)]);
            } else {
                setTagDataRecent([...tagDataRecentRef.current, { ...tag, count: 1 }]);
            }
        }

        return () => {
            document.removeEventListener('alertEvent', alertListener)
            document.removeEventListener('newTagEvent', tagListener)
        }
    }, []);

    return (
        <TagData.Provider value={{ data: tagData }}>
            <TagDataRecent.Provider value={{ data: tagDataRecent }}>
                {props.children}
            </TagDataRecent.Provider>
        </TagData.Provider>
    );
}

export { EelListener, TagData, TagDataRecent }; 