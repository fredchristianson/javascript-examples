
class BrowserWindow {
    constructor() {
        this._window = null;
    }

    setWindow(w) { this._window = w; }
}

class ChildWindow extends BrowserWindow {
    constructor(name, url) {
        super();
        this._name = name;
        this._messageHandler = null;
        this._window = null;
    }

    setMessageHandler(handler) {
        this._window.addEventListener('message', handler);
    }

    getBody() { return this._window.document.body; }

    querySelector(selector) {
        return this._window.document.body.querySelector(selector);
    }

    async open(url) {
        await this._checkMultipleScreenPermission();
        const child = window.open(
            url,
            this._name,
            'toolbar=false,resizeable=yes');
        this._window = child;
        return new Promise((resolve, reject) => {
            child.addEventListener('load', async () => {
                this.setWindow(child);
                this._loadScreenPosition();
                resolve(child);
            }, { once: true }
            );
        });
    }


    close() {
        this._saveScreenPosition();
        this._window?.close();
        this._window = null;
    }

    _checkMultipleScreenPermission() {
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
                this._window?.resizeTo(pos.w, pos.h);
                this._window?.moveTo(pos.x, pos.y);
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
        const w = this._window.outerWidth;
        const h = this._window.outerHeight;
        if (w > 0 && h > 0) {
            const pos = { x, y, w, h };
            const value = JSON.stringify(pos);
            //console.log(`save screen postion ${value}`);
            localStorage.setItem(`child-window-position-${this._name}`, value);
        }
    }
}

class ParentWindow extends BrowserWindow {
    constructor() {
        super();
        _setWindow(window.parent);
    }
}


export async function createChildWindow(name, url) {
    const child = new ChildWindow(name);
    try {
        await child.open(url);
        return child;
    } catch (ex) {
        alert(`Error openening url ${url}`);
        return null;
    }
}