import React, { useState, Fragment, useRef, useEffect } from "react";
import { Button, InputLabel, FormControl } from "@mui/material";
import Icon from "components/Icon/Icon";
import './FileUpload.scss';
import { getRelativeTime } from "global/helperFunctions";
import { useAlert } from "react-alert";

const FileUpload = (props) => {
    const alert = useAlert();
    const dropRef = useRef(null);
    const inputRef = useRef(null);

    const [fileDragged, setFileDragged] = useState(false);
    const [file, _setFile] = useState(null);
    const [fileDetails, setFileDetails] = useState("");

    useEffect(() => {
        const dragOver = dropRef.current.addEventListener('dragover', handleDragOver);
        const dragLeave = dropRef.current.addEventListener('dragleave', handleDragLeave);
        const drop = dropRef.current.addEventListener('drop', handleDrop);
        const click = dropRef.current.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('dragover', dragOver);
            document.removeEventListener('dragleave', dragLeave);
            document.removeEventListener('drop', drop);
            document.removeEventListener('click', click);
        };
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDragged(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDragged(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDragged(false);

        const { files } = e.dataTransfer;
        if (files && files.length) {
            setFileDetails(files[0]);
            readFile(files[0]);
            console.log("file:", file);
        }
    };

    const handleClick = (e) => {
        inputRef.current.click();
    }

    const setFile = (file) => {
        props.callback(file)
        _setFile(file)
    }

    const readFile = (file) => {
        try {
            const fileReader = new FileReader();
            setFileDetails(file);
            fileReader.readAsText(file, "UTF-8");
            fileReader.onload = e => {
                setFile(JSON.parse(e.target.result));
            };
        } catch (e) {
            console.log("error:", e);
            handleError(e);
        }
    };

    const handleFileInput = (e) => {
        const { files } = e.target;
        if (files && files.length) {
            setFileDetails(files[0]);
            readFile(files[0]);
        }
    }

    const getUniqueIdCount = (file) => {
        try {
            const uniqueIds = new Set();
            file.forEach(tag => {
                uniqueIds.add(tag.wispId);
            });
            return uniqueIds.size;
        } catch (e) {
            handleError(e);
            return null
        }
    }

    const getLastSeen = (file) => {
        try {
            return getRelativeTime(file[file.length - 1].seen);
        } catch (e) {
            handleError(e);
            return null
        }
    }

    const handleError = (e) => {
        alert.show('It looks like the file you imported was improperly formatted.', { title: "Malformed session file", timeout: 3000, type: 'error', icon: 'signal_cellular_no_sim' });
        console.log("malformed session data file:", e);
        setFileDetails(null);
        setFile(null);
    }


    return (
        <div>
            <div className="file-drop-area" ref={dropRef} style={{ backgroundColor: fileDragged ? "#cbcfd8" : "" }}>
                <input ref={inputRef} type="file" name="name" style={{ display: 'none' }} onChange={handleFileInput} />
                {!file ? (
                    <span>{fileDragged ? "Drop your file" : "Drop a file here, or click to browse"}</span>
                ) : (
                    <div className="file-area">
                        <div className="file-icon">
                            <Icon name="description" />
                            <p>{fileDetails.name.replace(".json", "")}</p>
                        </div>
                        <div className="file-details">
                            <p><strong>{file.length} tags</strong> total tags,</p>
                            <p>with <strong>{getUniqueIdCount(file)} unique WISP IDs</strong>,</p>
                            <p>and the most recent tag from <strong>{getLastSeen(file)}</strong>.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileUpload;