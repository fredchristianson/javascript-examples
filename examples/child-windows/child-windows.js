import { createLogger } from "./logger.js";
const log = createLogger("Window");


/**
 * The variable named globalWindow is the global window object.
 * This makes it obvious when reading code, which window is being used.
 *
 * @type {Window}
 */
const globalWindow = window;

/**
 * The variable named openerWindow is the window.opener object.
 * 
 * It will be null unless this is a ChildWindow with access to the window
 * it was created from.
 *
 * This makes it obvious when reading code, which window is being used.
 *
 * @type {Window}
 */
const openerWindow = window;

class BrowserWindow {
    constructor() {
        this._window = null;
        this._callOnClose = null;
        this._callOnMessage = null;
    }

    setWindow(w) {
        this._window = w;
        this._window.addEventListener('beforeunload',
            this._onBeforeUnloadHandler.bind(this));
        this._window.addEventListener('message',
            this._messageHandler.bind(this));
        this._dodument = this._window.document;
        this._dodument = this._window.document?.body;
    }


    getBody() { return this._window?.document?.body; }

    querySelector(selector) {
        return this._window?.document?.body?.querySelector(selector);
    }

    setCloseHandler(handler) {
        this._callOnClose = handler;
    }

    setMessageHandler(handler) {
        this._callOnMessage = handler;
    }

    _onBeforeUnloadHandler(event) {
        if (this._callOnClose) {
            this._callOnClose();
        }
    }

    _messageHandler(event) {
        if (this._callOnMessage) {
            this._callOnMessage(event.data);
        }
    }

}

class ChildWindow extends BrowserWindow {
    constructor(name) {
        super();
        this._name = name;

        this._childWindow = null;
    }


    async open(url) {
        await this._checkMultipleScreenPermission();
        // the target can't have whitespace
        const target = this._name.replaceAll(/[ \t\n]+/g, '');
        const features = this._createFeatures();
        log.debug("create window features " + features);
        const child = window.open(
            url,
            target,
            features);
        this._childWindow = child;

        return new Promise((resolve, reject) => {
            if (child == null) {
                alert("unable to open child window");
                reject();
            }
            child.addEventListener('error', async (_event) => {
                child.document.title = this._name;
                reject();
            });
            child.addEventListener('load', async (_event) => {
                // add spaces to "hide" extra info browsers may add (e.g. "Google Chrom");
                child.document.title = this._name;
                this.setWindow(child);
                this._loadScreenPosition();
                resolve(child);
            }, { once: true }
            );
        });
    }

    _createFeatures() {
        let values = ["popup=true"];
        try {
            const position = localStorage.getItem(`child-window-position-${this._name}`);
            if (position !== null && typeof position == 'string') {
                values = []; // no popup if we have a position
                // pos
                let pos = JSON.parse(position);
                if (typeof pos.left == 'number') {
                    values.push(`left=${pos.left}`);
                }
                if (typeof pos.top == 'number') {
                    values.push(`top=${pos.top}`);
                }
                if (typeof pos.width == 'number') {
                    values.push(`width=${pos.width}`);
                }
                if (typeof pos.height == 'number') {
                    values.push(`height=${pos.height}`);
                }
            }
        } catch (ex) {
            // ignore exceptions (invalid JSON position in localStorage)
            log.error("cannot parse position " + ex.message);
            console.log(ex);
        }

        return values.join(',');
    }


    close() {
        log.debug(`closing window ${this._name}`);
        this._saveScreenPosition();
        this._childWindow?.close();
        this._window = null;
    }

    _checkMultipleScreenPermission() {
        if (!('getScreenDetails' in window)) {
            return true;
        }
        return new Promise((resolve, reject) => {
            // use the main window, not the new window for multi-screen permissions
            window.getScreenDetails()
                .then(() => {
                    //user allowed multiscreen
                    resolve(true);
                })
                .catch((ex) => {
                    // user did not allow multiscreen.  not a problem.
                    resolve(false);
                });
        });
    }

    _loadScreenPosition() {

        const value = localStorage.getItem(`child-window-position-${this._name}`);
        if (value) {
            const pos = JSON.parse(value);
            if (pos.w > 100 && pos.h > 100) {
                this._window?.resizeTo(pos.width, pos.height);
                this._window?.moveTo(pos.left, pos.top);
            }
        }
    }

    _saveScreenPosition() {
        if (this._window == null || this._window.closed) {
            return;
        }

        /*
         * if user allowed multiple screens, this will get the
         * screen position.  if not, this will position the this._window
         * on the main this._window's screen;
         */
        const x = this._window.screenX;
        const y = this._window.screenY;
        const w = this._window.innerWidth;
        const h = this._window.innerHeight;
        if (w > 0 && h > 0) {
            const pos = { left: x, top: y, width: w, height: h };
            const value = JSON.stringify(pos);
            log.debug(`save screen postion ${value}`);
            localStorage.setItem(`child-window-position-${this._name}`, value);
        }
    }
}

class ParentWindow extends BrowserWindow {
    constructor() {
        super();
        _setWindow(window.opener);
    }
}

const defaultChildWindowFeatures = {
    menubar: true,
    toolbar: true,
    location: true,
    status: true,
    resizable: true,
    scrollbars: true
};

export async function createChildWindow(name, url) {
    const child = new ChildWindow(name);
    try {
        await child.open(url);
        return child;
    } catch (ex) {
        alert(`Error openening url ${url}.  Are popup windows blocked?`);
        console.log(ex);
        return null;
    }
}
