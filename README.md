# WISP Desktop

A GUI desktop interface for WISP tags, using [sllurp2](https://github.com/fviard/sllurp/tree/fviard-develop-v2/sllurp) for the RFID reader interface, and [react](https://github.com/facebook/react) and [eel](https://github.com/ChrisKnott/Eel) for the UI.

Pre-built releases of the app are available in `releases/`.

## Building the app using the script
### Using the python script
1. Clone this repo
2. Install Python dependencies:
   1. cd into `python/`
   2. `pip install eel pyinstaller`
   3. Install sllurp2 from source with `pip install ./sllurp`
3. Install react and dependencies:
   1. cd into `react/`
   2. `npm install`
4. From the root directory, run `python build_app.py`  
From now on, just run the script after making changes.
