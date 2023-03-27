import { namespace } from './child-window-namespace.js';
import { createLogger } from "./logger.js";
const log = createLogger("Window");




/**
 * The base class for ParentWindow and ChildWindow.
 * Provides methods to get the other window's DOM.
 *
 */
export class BrowserWindow {
    constructor() {
        this._window = null;
        this._callOnClose = [];
        this._callOnMessage = [];
        this._dodument = null;
        this._body = null;
    }


    /**
     * return the DOM body if the window has been connected
     *
     * @returns {HTMLElement}
     */
    getBody() { return this._body; }

    /**
     * execute querySelector on the other windows body.  You can
     * do the same with getBody()
     *
     * @param {String} selector
     * @returns {HTMLElement} the result element or null if not found
     */
    querySelector(selector) {
        return this._body?.querySelector(selector) ?? null;
    }

    /**
     * adds a function to call when the window is closed by the user or close() method
     *
     * @param {function} handler is called when (before) window closes
     */
    addCloseHandler(handler) {
        this._callOnClose.push(handler);
    }

    /**
     * adds a function to call when the window 
     * receives a "message" type event.  The data value is passed to the function
     *
     * @param {function} handler is called when a 'message' event is received
     */
    addMessageHandler(handler) {
        this._callOnMessage.push(handler);
    }


    /**
     * calls all functions added with addCloseHandler
     */
    _callCloseHandlers() {
        for (let handler of this._callOnClose) {
            try {
                handler();
            } catch (ex) {
                log.error(`onCloseHandler failed ${ex.message}`);
            }
        }

    }

    /**
     * calls all functions added with addMessageHandler
     */
    _messageHandler(event) {
        for (let handler of this._callOnMessage) {
            try {
                handler(event.data);
            } catch (ex) {
                log.error(`onMessageHandler failed ${ex.message}`);
            }
        }

    }


    /**
     * setup the Window instance
     *
     * @private
     * @param {*} w
     */
    _setWindow(w) {
        this._window = w;
        if (this._window != null) {
            this._window.addEventListener('message',
                this._messageHandler.bind(this));
            this._dodument = this._window.document;
            this._body = this._window.document?.body;
        }
    }


}

/**
 * Listen for 'beforeunload' events and close all children
 * before this window is closed.
 */
function closeChildren() {
    const children = namespace.children || [];
    for (let child of children) {
        child.close();
    }
    namespace.children = [];
}

addEventListener('beforeunload', closeChildren);

/**
 * adds a child to the namespace.  not intended to be used 
 * outside of ChildWindow
 *
 * @param ChildWindow} child
 */
export function addChild(child) {
    const children = namespace.children || [];
    children.push(child);
    namespace.children = children;
}

/**
 * removes a child from the namespace.  not intended to be used 
 * outside of ChildWindow
 *
 * @param ChildWindow} child
 */
export function removeChild(child) {
    child._callCloseHandlers();
    const children = namespace.children || [];
    const index = children.indexOf(child);
    if (index >= 0) {
        children.splice(index, 1);
    }
}