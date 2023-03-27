import { createChildWindow } from "./child-windows.js";
import { LOGLEVEL, setLogManager } from "./logger.js";


/**
 * This is a singleton that listens for window "message" events
 * and writes the to the console and to a child window (log.html).
 */
class LogManager {
    constructor() {
        this._logWindow = null;
        this._domParser = new DOMParser();
    }

    /**
     * create the child window to display log messages and
     * addEventListener for 'message' events.
     *
     * @async
     * @returns {*}
     */
    async open() {
        this._logWindow = await createChildWindow('log', 'log.html');
        this._messages = this._logWindow.querySelector('.messages');
        window.addEventListener('message', this.handleMessage.bind(this));

    }

    /**
     * Write the data from 'message' events to the javascript console
     * and append it to the child window's '.messages' element.
     *
     * @param {Event} event
     */
    async handleMessage(event) {
        // re-open the log window if the user has closed it
        await this._logWindow.ensureOpen()
        this._messages = this._logWindow.querySelector('.messages');

        const data = event.data;
        console.debug(`${data.time.toLocaleTimeString()}: ${data.level} : ${data.logger} : ${data.message}`);
        const html = `<div class='log ${data.level}'><span class='time'>${data.time.toLocaleTimeString()}</span>` +
            `<span class='level'>${data.level}</span><span class='module'>${data.logger}</span>` +
            `<span class='message'>${data.message}</span></div >`;
        const div = this._domParser.parseFromString(html, 'text/html');
        this._messages.append(div.body.childNodes[0]);
        const logWindowBody = this._logWindow.getBody();
        if (logWindowBody) {
            logWindowBody.scrollTop = logWindowBody.offsetHeight;
        }
    }

    // close the log window.
    close() {
        this._logWindow?.close();
    }
}

export { LOGLEVEL } from './logger.js';


/**
 * this should be called once to setup logging
 *
 * @export
 * @async
 * @returns {unknown}
 */
export async function createLogManager() {
    const manager = new LogManager();
    await manager.open();
    setLogManager(manager);
    return manager;
}

