# WISP Desktop

Branch for Ines!

A GUI desktop interface for WISP tags, using [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) to interface an RFID reader, and [react](https://github.com/facebook/react) and [eel](https://github.com/ChrisKnott/Eel) for the UI.

## Installing the app
Pre-built releases of the app are available for Windows and Linux in the [releases](https://github.com/wisp/wisp-desktop/releases/) section on GitHub.

## Building the app using the script
1. Install the Python dependencies with `pip install eel pyinstaller pillow`
2. Clone this repo
3. Copy [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) and put it in the `python` folder, naming it `sllurp`. This is where pyinstaller expects a copy of the module.
4. Install js dependencies by running `npm install` from the `/react` folder  
5. Run `python build_app.py` (`--no-react` and `--no-python` can be used to skip parts of the build)  
From now on, just run the script after making changes.

## Modifying the app
It's relatively easy to add support for a custom WISP sensor type or create a new front-end widget for visualization. You can find the guide to do that in [`CUSTOMIZATION.md`](https://github.com/rmenon1008/wisp-desktop/tree/master/CUSTOMIZATION.md).
