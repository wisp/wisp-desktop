import { ReaderLogs } from "dataManagement/EelListener"
import { useContext, useRef, useEffect } from "react"

const ReaderConsole = (props) => {
    const readerLogs = useContext(ReaderLogs);
    const bottomElement = useRef();

    // bottomElement.current.scrollIntoView();

    useEffect(() => {
        bottomElement.current.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start'});
    }
    , [readerLogs]);

    return (
        <div className='debug-console'>
            <div>
                {
                    readerLogs.logs.map((log) => {
                        return (<p>{log}</p>)
                    })
                }
            </div>
            <div className="bottom-element" ref={bottomElement}></div>
        </div >
    )
}

export default ReaderConsole;