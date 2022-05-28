import Window from 'components/window/Window/Window'
import { useContext } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import { Connection } from 'dataManagement/ConnectionContext';
import Icon from 'components/Icon/Icon';

const TemplateWidget = (props) => {
    // TagData contains every tag that's been seen by the
    // reader, with the most recent tag at the end of the
    // array.
    const tagData = useContext(TagData).data;

    // TagDataRecent contains the most recent tag that's
    // been seen by the reader for each WISP ID. If
    // another tag is seen with the same WISP ID, it
    // replaces the entry rather than adding a new one.
    const tagDataRecent = useContext(TagDataRecent).data;

    // Connection keeps the connection status, settings
    // and filters. The second element in the array can
    // be used to modify settings or filters.
    const [connection, ] = useContext(Connection);

    return (
        <Window title="Template Widget" right={<Icon small name="close" click={props.onClose} />}>
            Total tags read by the reader: {tagData.length}
            <br/><br/>
            Unique tags read: {tagDataRecent.length}
            <br/><br/>
            Connection status: {connection.status.connected ? "Connected" : "Disconnected"}
        </Window>
    );
}

export default TemplateWidget;