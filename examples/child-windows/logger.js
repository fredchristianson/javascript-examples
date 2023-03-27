import { createChildWindow } from "./child-windows.js";

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

export const LOGLEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class LogCreator {
    constructor(name, level = LOGLEVEL.DEBUG) {
        this._name = name;
        this._level = level;
    }

    debug(message) {
        if (this._level >= LOGLEVEL.DEBUG) {
            this.sendMessage(message, "debug");
        }
    }

    info(message) {
        if (this._level >= LOGLEVEL.INFO) {
            this.sendMessage(message, "info");
        }
    }

    warn(message) {
        if (this._level >= LOGLEVEL.WARN) {
            this.sendMessage(message, "warn");
        }
    }

    error(message) {
        this.sendMessage(message, "error");
    }

    sendMessage(message, level) {
        const data = {
            message,
            time: new Date(),
            logger: this._name,
            level: level
        };
        if (window.opener) {
            window.opener.postMessage(data, '*');
        } else {
            window.postMessage(data, '*');
        }

    }
}


export async function createLogManager() {
    const manager = new LogManager();
    await manager.open();
    return manager;
}

export function createLogger(name) {
    return new LogCreator(name);
}