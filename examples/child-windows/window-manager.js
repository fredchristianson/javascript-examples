import { namespace } from './child-window-namespace.js';
import { createLogger } from "./logger.js";
const log = createLogger("Window");


/**
 * The variable named globalWindow is the global window object.
 * This makes it obvious when reading code, which window is being used.
 *
 * @type {Window}
 */
export const globalWindow = window ?? null;

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
export const openerWindow = window?.opener ?? null;

export class BrowserWindow {
    constructor() {
        this._window = null;
        this._callOnClose = [];
        this._callOnMessage = [];
        this._dodument = null;
        this._body = null;
    }

    _setWindow(w) {
        this._window = w;
        if (this._window != null) {
            this._window.addEventListener('message',
                this._messageHandler.bind(this));
            this._dodument = this._window.document;
            this._body = this._window.document?.body;
        }
    }


    getBody() { return this._body; }

    querySelector(selector) {
        return this._body?.querySelector(selector) ?? null;
    }

    addCloseHandler(handler) {
        this._callOnClose.push(handler);
    }

    addMessageHandler(handler) {
        this._callOnMessage.push(handler);
    }


    _callCloseHandlers() {
        for (let handler of this._callOnClose) {
            try {
                handler();
            } catch (ex) {
                log.error(`onCloseHandler failed ${ex.message}`);
            }
        }

    }

    _messageHandler(event) {
        for (let handler of this._callOnMessage) {
            try {
                handler(event.data);
            } catch (ex) {
                log.error(`onMessageHandler failed ${ex.message}`);
            }
        }

    }

}

function closeChildren() {
    const children = namespace.children || [];
    for (let child of children) {
        child.close();
    }
    namespace.children = [];
}

addEventListener('beforeunload', closeChildren);

export function addChild(child) {
    const children = namespace.children || [];
    children.push(child);
    namespace.children = children;
}

export function removeChild(child) {
    child._callCloseHandlers();
    const children = namespace.children || [];
    const index = children.indexOf(child);
    if (index >= 0) {
        children.splice(index, 1);
    }
}