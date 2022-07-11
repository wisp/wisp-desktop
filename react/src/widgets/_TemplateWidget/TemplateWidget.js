import Window from 'components/window/Window/Window'
import { useContext } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import { Connection } from 'dataManagement/ConnectionContext';
import Icon from 'components/Icon/Icon';

const TemplateWidget = (props) => {
    // TagData contains an array of every tag that's been
    // seen by the reader, with the most recent tag at the
    // end of the array.
    const tagData = useContext(TagData).data;

    // TagDataRecent contains a dictionary of tags read by
    // the reader, with the keys being each tag's WISP ID.
    const tagDataRecent = useContext(TagDataRecent).data;

    // Connection keeps the connection status, settings
    // and filters.
    const connectionStatus = useContext(Connection).connectionStatus;

    return (
        <Window title="Template Widget" right={<Icon small name="close" click={props.onClose} />}>
            Total tags read by the reader: {tagData.length}
            <br/><br/>
            Unique tags read: {Object.keys(tagDataRecent).length}
            <br/><br/>
            Connection status: {connectionStatus.isConnected ? "Connected" : "Disconnected"}
        </Window>
    );
}

export default TemplateWidget;