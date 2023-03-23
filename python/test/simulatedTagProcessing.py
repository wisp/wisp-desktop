from main import RFIDReader
import json
import time
import eel
import atexit
import os
import threading
import socket

rfid = RFIDReader()

@eel.expose
def connect(host, port):
    return True

@eel.expose
def disconnect():
    return True

@eel.expose
def startInventory(antennas, tx_power, mode_identifier):
    return True

@eel.expose
def stopInventory():
    return True

@eel.expose
def changeFilters(whitelist, blacklist):
    return True

watchdog = None
@eel.expose
def alive():
    global watchdog
    watchdog = time.time()

def onScriptClose():
    eel.closeGUI()
    rfid.kill_all()

atexit.register(onScriptClose)

def onGUIClose(a, b):
    print("GUI closed... killing")
    rfid.kill_all()
    os._exit(1)

def tag_creation():
    print("Starting tag creation thread")
    obj = json.loads(open("testdata.json").read())
    _ = 0
    while True:
        start_time = time.perf_counter()
        rfid.tag_seen(_, obj)
        print("Tag creation took {}ms".format((time.perf_counter() - start_time) * 1000))
        time.sleep(1/1000)

tagCreationThread = threading.Thread(target=tag_creation)
tagCreationThread.start()

print("Running in production mode:")
eel.init('web')  # Give folder containing web files
# Check if port 3467 is available
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind(("localhost", 3467))
    s.close()
except socket.error as e:
    print("Port 3467 is already in use. This is likely because the app did not close properly the last time it was run.")
    print("Please close the app and try again.")
    raise Exception(
        "The app is still running in the background. Wait a moment and the app should close itself.")

eel.start("index.html", host="localhost", port=3467, block=False, close_callback=onGUIClose, shutdown_delay=5, cmdline_args=[
            "--disable-web-security", "--disable-translate", "--enable-kiosk-mode"])
# Ensure we are receiving is_alive messages from the GUI
# watchdog = time.time() + 20 # Give the GUI 15 seconds to start
while True:
    if ((watchdog is not None) and (time.time() - watchdog > 25)):
        print("GUI is not responding... killing")
        eel.closeGUI()
        rfid.kill_all()
        os._exit(1)
    eel.sleep(1)