# WISP Desktop

A GUI desktop interface for WISP tags, using [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) for the RFID reader interface, and [react](https://github.com/facebook/react) and [eel](https://github.com/ChrisKnott/Eel) for the UI.

Pre-built releases of the app are available in `releases/`.

## Building the app using the script
### Using the Python script
1. Clone this repo
2. Clone [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) and install it
3. Install other Python dependencies with `pip install eel pyinstaller`
4. Install js dependencies by running `npm install` from the react folder
5. Run `python build_app.py`  
From now on, just run the script after making changes.
