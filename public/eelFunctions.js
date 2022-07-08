// const eel = window.eel;
eel.set_host('http://localhost:8888')

eel.expose(acceptTag);
function acceptTag(tagData) {
    const event = new CustomEvent('acceptTag', { detail: tagData });
    document.dispatchEvent(event);
}

eel.expose(createAlert);
function createAlert(type, title, message, icon = "info") {
    const event = new CustomEvent('createAlert', { detail: { type, title, message, icon } });
    document.dispatchEvent(event);
}

eel.expose(readerLog);
function readerLog(message) {
    const event = new CustomEvent('readerLog', { detail: message });
    document.dispatchEvent(event);
}

eel.expose(closeGUI);
function closeGUI() {
    console.log("closing window");
    window.onbeforeunload = null;
    window.close();
}