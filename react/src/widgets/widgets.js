// Steps to add a new widget:
// 1. Add the new widget to this folder. You should start
//    with the template widget that's provided for you.

// 2. Import it here
import ImuDemo from './ImuDemo/ImuDemo';
import Graph from './Graph/Graph';
import RecentTags from './RecentTags/RecentTags';
import TemplateWidget from './_TemplateWidget/TemplateWidget';
import DataExporter from './DataExporter/DataExporter';
import ImgCapture from './ImgCapture/ImgCapture';
import Gauge from './Gauge/Gauge';

// 3. Add it to the widgets object with it's properties
//    (icon names are from https://fonts.google.com/icons)
const widgets = {
    // TemplateWidget: {
    //     "title": "Template Widget",
    //     "component": <TemplateWidget/>,
    //     "icon": "copy_all",
    //     "maxSize": [null, null],
    //     "minSize": [3, 3],
    //     "defaultSize": [3, 3]
    // },
    RecentTags: {
        title: "Table",
        component: <RecentTags />,
        icon: "table_chart",
        maxSize: [null, null],
        minSize: [7, 2],
        defaultSize: [11, 4]
    },
    Graph: {
        title: "Chart",
        component: <Graph />,
        icon: "insert_chart",
        maxSize: [null, null],
        minSize: [7, 5],
        defaultSize: [11, 7]
    },
    Gauge: {
        title: "Gauge",
        component: <Gauge />,
        icon: "speed",
        maxSize: [5, 8],
        minSize: [2, 4],
        defaultSize: [2, 4]
    },
    DataExporter: {
        title: "Data Exporter",
        component: <DataExporter />,
        icon: "ios_share",
        maxSize: [4, null],
        minSize: [4, 3],
        defaultSize: [4, 3]
    },
    ImuDemo: {
        title: "IMU Visualization",
        component: <ImuDemo />,
        icon: "view_in_ar",
        maxSize: [null, null],
        minSize: [3, 4],
        defaultSize: [4, 5]
    },
    ImgCapture: {
        title: "Image Capture",
        component: <ImgCapture />,
        icon: "photo_library",
        maxSize: [null, null],
        minSize: [4, 3],
        defaultSize: [5, 4]
    },
}

export default widgets;