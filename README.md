# WISP Desktop

A GUI desktop interface for WISP tags, using [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) to interface an RFID reader, and [react](https://github.com/facebook/react) and [eel](https://github.com/ChrisKnott/Eel) for the UI.

## Installing the app
Pre-built releases of the app are available for Windows and Linux in [`/releases`](https://github.com/rmenon1008/wisp-desktop/tree/master/releases).

## Building the app using the script
1. Clone [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) and install it
2. Install other Python dependencies with `pip install eel pyinstaller pillow`
3. Clone this repo
4. Install js dependencies by running `npm install` from the `/react` folder  
5. Run `python build_app.py` (`--no-react` and `--no-python` can be used to skip parts of the build)
From now on, just run the script after making changes.

## Modifying the app
It's relatively easy to add support for a custom WISP sensor type or create a new front-end widget for visualization. You can find the guide to do that in [`CUSTOMIZATION.md`](https://github.com/rmenon1008/wisp-desktop/tree/master/CUSTOMIZATION.md).
