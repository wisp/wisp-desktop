import { useEffect, useState, useCallback, useRef, createContext } from 'react'
import { useAlert } from 'react-alert'
import { getRelativeTime } from '../global/helperFunctions';

const TagData = createContext([]);
const TagDataRecent = createContext([]);
const Connection = createContext({});

const EelListener = (props) => {
    const alert = useAlert();
    // let tagData = [];
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

    const [connection, setConnection] = useState({
        status: {
            connected: false,
            totalTags: 0,
            tagRate: 0,
            mostRecent: undefined,
        },
        settings: {
            host: "",
            port: 5084,
            tari: 7140,
            antennas: [1],
            power: 0,
            mode: 0,
        }
    });

    function getTagRate() {
        if (connection.status.connected) {
            // get the time from 15 seconds ago
            const time = (new Date().getTime() - 15000) / 1000;
            // get the tags that were added in the last 15 seconds
            const tags = tagData.filter(tag => tag.time > time);
            // get the number of tags that were added in the last 15 seconds
            const tagRate = tags.length;
            // return the tag rate
            return tagRate / 15;
        }
        return 0;
    }

    function updateTagStats() {
        if (tagData.length > 0) {
            setConnection({
                ...connection,
                status: {
                    ...connection.status,
                    totalTags: tagData.length,
                    tagRate: getTagRate(),
                    mostRecent: tagData[tagData.length - 1].seen,
                }
            })
        }
    }



    useEffect(() => {
        const alertListener = document.addEventListener('alertEvent', (e) => {
            alert.show(e.detail.message, { title: e.detail.title, timeout: 3000, type: e.detail.type, icon: e.detail.icon });
        })

        const tagListener = document.addEventListener('newTagEvent', (e) => {
            const tag = e.detail

            setTagData([...tagDataRef.current, tag]);

            updateTagStats();

            const index = tagDataRecentRef.current.findIndex(t => t['wispId'] == tag['wispId']);
            if (index !== -1) {
                const prevTag = tagDataRecentRef.current[index];
                tag.count = prevTag.count + 1;
                setTagDataRecent([...tagDataRecentRef.current.slice(0, index), tag, ...tagDataRecentRef.current.slice(index + 1)]);
            } else {
                setTagDataRecent([...tagDataRecentRef.current, { ...tag, count: 1 }]);
            }
        })

        const updater = setInterval(() => {
            updateTagStats();
        }, 1000);

        return () => {
            document.removeEventListener('alertEvent', alertListener)
            document.removeEventListener('newTagEvent', tagListener)
            clearInterval(updater)
        }
    }, []);

    return (
        <TagData.Provider value={{ data: tagData }}>
            <TagDataRecent.Provider value={{ data: tagDataRecent }}>
                <Connection.Provider value={[connection, setConnection]}>
                    {props.children}
                </Connection.Provider>
            </TagDataRecent.Provider>
        </TagData.Provider>
    );
}

export { EelListener, TagData, TagDataRecent, Connection }; 