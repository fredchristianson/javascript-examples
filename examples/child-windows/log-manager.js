import { createChildWindow } from "./child-windows.js";
import { LOGLEVEL, setLogManager } from "./logger.js";

class LogManager {
    constructor() {
        this._logWindow = null;
        this._domParser = new DOMParser();
    }

    async open() {
        this._logWindow = await createChildWindow('log', 'log.html');
        this._messages = this._logWindow.querySelector('.messages');
        window.addEventListener('message', this.handleMessage.bind(this));

    }

    handleMessage(event) {
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

    close() {
        this._logWindow?.close();
    }
}

export { LOGLEVEL } from './logger.js';

export async function createLogManager() {
    const manager = new LogManager();
    await manager.open();
    setLogManager(manager);
    return manager;
}

