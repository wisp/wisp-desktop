// Steps to add a new widget:
// 1. Add the new widget to this folder. You can start
//    with the template widget that's provided

// 2. Import it here
import ImuDemo from './ImuDemo/ImuDemo';
import Graph from './Graph/Graph';
import RecentTags from './RecentTags/RecentTags';
//import TemplateWidget from './_TemplateWidget/TemplateWidget';
import DataExporter from './DataExporter/DataExporter';
import ImgCapture from './ImgCapture/ImgCapture';
import AudioCapture from './AudioCapture/AudioCapture';
import Gauge from './Gauge/Gauge';
import TagRate from './TagRate/TagRate';

// 3. Add it to the widgets object with it's properties
//    (icon names from https://fonts.google.com/icons?icon.set=Material+Icons)
const widgets = [
    // TemplateWidget: {
    //     "title": "Template Widget",
    //     "component": <TemplateWidget/>,
    //     "icon": "copy_all",
    //     "maxSize": [null, null],
    //     "minSize": [3, 3],
    //     "defaultSize": [3, 3]
    // },
    {
        title: "Table",
        component: <RecentTags />,
        icon: "table_chart",
        maxSize: [null, null],
        minSize: [7, 2],
        defaultSize: [11, 4]
    },
    {
        title: "Chart",
        component: <Graph />,
        icon: "insert_chart",
        maxSize: [null, null],
        minSize: [7, 5],
        defaultSize: [11, 7]
    },
    {
        title: "Gauge",
        component: <Gauge />,
        icon: "speed",
        maxSize: [5, 8],
        minSize: [2, 4],
        defaultSize: [2, 4]
    },
    {
        title: "Data Exporter",
        component: <DataExporter />,
        icon: "ios_share",
        maxSize: [4, null],
        minSize: [4, 3],
        defaultSize: [4, 3]
    },
    {
        title: "Tag Rate",
        component: <TagRate />,
        icon: "timer",
        maxSize: [4, 4],
        minSize: [4, 4],
        defaultSize: [4, 4]
    },
    {
        title: "IMU Visualization",
        component: <ImuDemo />,
        icon: "view_in_ar",
        maxSize: [null, null],
        minSize: [3, 4],
        defaultSize: [4, 5]
    },
    {
        title: "Image Capture",
        component: <ImgCapture />,
        icon: "photo_library",
        maxSize: [null, null],
        minSize: [4, 3],
        defaultSize: [5, 4]
    },
    {
        title: "Audio Capture",
        component: <AudioCapture />,
        icon: "mic",
        maxSize: [null, null],
        minSize: [6, 3],
        defaultSize: [6, 4]
    },
];

export default widgets;