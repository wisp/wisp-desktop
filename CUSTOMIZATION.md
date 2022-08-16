# Adding a new tag type
## Background
All the data in a WISP tag is contained within it's EPC. This 96 byte value is treated as a 24 character, uppercase, hex string by the app.

```                 
wispType ─┬┐  ┌─── wispData ───┐ ┌──┬─ wispId
          0B  01CE02000260000141 0042
```

In order to process the tag, the app looks for a definition in `tagDict.py` with a matching `wispType`. If one is found, the defined `parser` and `parserString` are used to add formatted versions of the data to the tag report.

Note: In order to maximize the transmission rate, WISPCam tags don't have a unique WISP ID. Instead, the application assigns all WISPCam tags with the ID `CA00`.

## Adding a new tag definition
Add an entry to the `dict` object in `tagDict.py`. The key is the wispType being added. `name` should be a string. `parser` and `parserString` should be defined as lambda functions that accepts the full 24 character EPC (most of the time `wispData` is all you'll need to access).

```python
defs = {
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda epc : accelParser(epc),
        'parserString': lambda epc : accelParserString(epc),
    }
    ...
}
```

`parserString` should return a readable string representation of the data. `parser` should return an object with any number of entries, each with `value`, `unit` and `label` fields.
```python
def someParser(epc):
	# Process data here
    return {
        'data1': {
            'value': val1,            # Number
            'unit': 'some units',     # String
            'label': 'Readable Name'  # String
        },
	...
    }
```

After rebuilding, tags with a matching `wispId` should be processed and have additional `formatted` and `formattedString` fields.

# Adding a new  widget

## Creating a widget
On the frontend, widgets are used to visualize tag data. Each widget is structured as a React functional component.

The components within a widget can subscribe to various global contexts ([read more about context](https://reactjs.org/docs/context.html)). Currently there are context providers available for:
1. `TagData`: an array of every tag that's been read in this session
2. `TagDataRecent`: an object with `wispId` tags, each with the most recent data from each tag
3. `Connection`: an object containing the current `connectionStatus` and functions for changing connection (connecting, starting inventory, etc.)

The `TemplateWidget` component shows an example of how these contexts can be implemented.

Much like state, a change in the context a component is consuming causes the component to render again. To minimize re-renders, only consume context within the components that need to update with the changing data.

Widgets should be placed in the `widgets` folder and follow the template below.
```jsx
<Window title="Widget Title" right={<Icon small name="close" click={props.onClose} />}>
    <InnerComponents>
</Window>
```

## Registering a new widget
After creating a new widget, edit the `widget.js` file. This contains a dictionary of all the widgets that will be displayed in the add dropdown. Begin by importing your new widget at the top of the file. Then create an entry in the dictionary that looks like:
```js
import NewWidget from './Widget/Widget'
...
const widgets = {
    ...
    NewWidget: {
        title: "Widget Name",
        component: <NewWidget/>,
        icon: "icon",           // Icons come from fonts.google.com/icons Material Icons library
        maxSize: [null, null],   
        minSize: [7, 2],        // Sizes are in units of the window grid. The number of rows and
        defaultSize: [11, 4]    // columns in the grid change depending on the app window size.
    },
    ...
}
```

After rebuilding, the widget should appear in the Add Widget dropdown.
