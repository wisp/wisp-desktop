import Icon from 'components/Icon/Icon';
import { useState, useContext } from 'react';
import { Button, FormGroup, Tooltip } from '@mui/material';
import { Connection } from 'dataManagement/ConnectionContext';
import ChipList from 'components/ChipList/ChipList';
import { TagData, TagDataRecent, TagDataModifiers } from 'dataManagement/EelListener';
import Modal from 'components/Modal/Modal';
import FileUpload from 'components/FileUpload/FileUpload';
import { useAlert } from "react-alert";
import { getRecentDataFromArray } from "global/helperFunctions";


const DataButtons = (props) => {
    const alert = useAlert();
    const tagData = useContext(TagData).data;
    const tagDataRecent = useContext(TagDataRecent).data;
    const [setTagData, setTagDataRecent] = useContext(TagDataModifiers);
    const [clearModal, setClearModal] = useState(false);
    const [loadModal, setLoadModal] = useState(false);
    const connectionStatus = useContext(Connection).connectionStatus;

    let newDataToLoad = [];

    function saveData() {
        const exportName = "WISP_Tag_Data";
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tagData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function clearData() {
        setClearModal(true);
    }

    function clearAllTagData() {
        setTagData([]);
        setTagDataRecent([]);
        alert.show('All session data cleared', { title: "Data cleared", timeout: 3000, type: 'info', icon: 'delete' });
    }

    function setTagDataFromArray() {
        const newTagDataRecent = getRecentDataFromArray(newDataToLoad);
        setTagDataRecent(newTagDataRecent);
        setTagData(newDataToLoad);
        alert.show('Session data was successfully loaded from the file', { title: "Data imported", timeout: 3000, type: 'success', icon: 'description' });
    }

    function newData(data) {
        newDataToLoad = data;
    }

    const availableToClear = tagData.length > 0;

    return (
        <div className="data-buttons">
            <h2>Session Data</h2>
            <Button
                size='small'
                variant="outlined"
                color="error"
                disabled={!availableToClear || connectionStatus.isInventorying}
                sx={{ width: "32%", mr: 1 }}
                onClick={() => {
                    clearData();
                }}
            >
                <Icon name="delete" small />&nbsp;
                Clear
            </Button>
            <Button
                size='small'
                variant="outlined"
                color="primary"
                disabled={!availableToClear || connectionStatus.isInventorying}
                sx={{ width: "31%", mr: 1 }}
                onClick={() => {
                    saveData();
                }}
            >
                <Icon name="download" small />&nbsp;
                Save
            </Button>
            <Modal show={clearModal} title="Clear Session Data" close={() => setClearModal(false)}>
                <p>Are you sure you want to delete all collected tag data?</p>
                <div class="spacer-15"/>
                <p>You have <strong>{tagData.length} total tag reads</strong> in this session, with <strong>{tagDataRecent.length} unique WISP IDs</strong>.</p>
                <div className="spacer-2" />
                <div className="form-group right">
                    <Button
                        color="primary"
                        onClick={() => {
                            setClearModal(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            setClearModal(false);
                            clearAllTagData();
                        }}
                    >
                        Clear Data
                    </Button>
                </div>
            </Modal>

            <Button
                variant="outlined"
                color="primary"
                size='small'
                disabled={availableToClear || connectionStatus.isInventorying}
                sx={{ width: "31%", mr: 0 }}
                onClick={() => {
                    // loadData();
                    setLoadModal(true);
                }}
            >
                <Icon name="upload" small />&nbsp;
                Load
            </Button>
            <Modal show={loadModal} title="Load Session Data" close={() => setLoadModal(false)}>
                {/* <p>Load session data from a file.</p> */}
                <FileUpload callback={newData}/>
                <div className="spacer-2" />
                <div className="form-group right">
                    <Button
                        color="primary"
                        onClick={() => {
                            setLoadModal(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setTagDataFromArray();
                            setLoadModal(false);
                        }}
                    >
                        Load
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default DataButtons;