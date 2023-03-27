/** @fileoverview  use the function createChildWindow() to 
 * open a new window.  It is an async function that waits
 * until the window is loaded and sets up some listeners
*/
import { createLogger } from "./logger.js";
import { BrowserWindow, addChild, removeChild } from "./window-manager.js";
const log = createLogger("ChildWindow");


/**
 * createChildWindow() creates one of these objects.
 * 
 * open() must be called to create the window.
 *
 * @extends {BrowserWindow}
 * 
 */
class ChildWindow extends BrowserWindow {
    /**
     * Creates an instance of ChildWindow.
     *
     * @constructor
     * @param {String} name the name the parent uses for this window
     * it is used to generate a browser "target" for the new window and 
     * as the title for the window.  If the "target" window exists, it may be reused.
     * The name is also used to save/restore the window's location
     */
    constructor(name) {
        super();
        this._name = name;

        this._childWindow = null;
        this._closing = false;
        this._url = null;
    }


    /**
     * use window.open() to create a new browser window and load a url
     *
     * @async
     * @param {string} url the url to open
     * @returns {Promise} a promise to wait for the url load to finish
     */
    async open(url) {
        await this._checkMultipleScreenPermission();
        // the target can't have whitespace
        this._url = url;
        const target = this._name.replaceAll(/[ \t\n]+/g, '');
        const features = this._createFeatures();
        log.debug("create window features " + features);
        this._closing = false;
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
                // this is not an HTTP error, but an error in the
                // initializing of the new page (i.e. javascript error on the page)
                child.document.title = this._name;
                reject();
            });
            child.addEventListener('load', async (_event) => {
                child.document.title = this._name;
                this._setWindow(child);
                this._loadScreenPosition();
                addChild(this);
                child.addEventListener("beforeunload", () => {
                    removeChild(this);
                });

                resolve(child);
            }, { once: true }
            );
        });
    }

    /**
     * The app can call this to re-open the window if the user has
     * closed it.
     *
     * @async
     * @returns {*}
     */
    async ensureOpen() {
        if (this._childWindow == null || this._childWindow.closed) {
            await this.open(this._url);
        }
    }

    /**
     * The 3rd parameter of window.open is a string of features.  
     * If we have saved the window's position before set the 
     * top/left/width/height features.
     * Otherwise set the "popup=true" feature and the browser will 
     * set the position.  If it is not a popup, it will probably
     * be a new tab instead of new window.
     *
     * @returns {*}
     */
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


    /**
     * close() is called to close the browser window
     */
    close() {
        if (this._closing) {
            return; // already closing.  
        }
        log.debug(`closing window ${this._name}`);
        this._closing = true;
        this._saveScreenPosition();
        this._childWindow?.close();
        this._window = null;
    }


    /**
     * On chrome, we need to ask the user for permission to restore
     * a window's position on a display other than where the main window is.
     * 
     * This only needs to be done the first time a new window is created and
     * only if window.getScreenDetails() exists.
     * 
     * @returns {Promise} a promise that will be resolved after the user grants
     * or denies permission to restore positions on multiple displays
     */
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


    /**
     * If a position has been saved in localStorage, it is used to 
     * move the window.  This should not be needed since it is
     * set with features in window.open()
     */
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

    /**
     * Save the curren screen position in localStorage.
     * This is called on the event "beforeunload" to restore
     * the last location when it is opened again
     */
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


/**
 * Create a new ChildWindow and wait for it to load
 *
 * @export
 * @async
 * @param {String} name of the child windo
 * @param {String} url to load
 * @returns {ChildWindow} the ChildWindow object to access the new window
 */
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
