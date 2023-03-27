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

        if (window.opener) {

            const data = {
                message,
                time: new Date(),
                logger: this._name,
                level: level
            };
            window.opener.postMessage(data, '*');
        } else {
            console.log(`${(new Date()).toLocaleTimeString()} ${level} : ${this._name} : ${message}`);
        }

    }
}

// if this is the main window, listen for message events
if (window.opener == null) {
    addEventListener("message", event => {
        const data = event.data;
        console.log(`${data.time.toLocaleTimeString()} ${data.level} : ${data.logger} : ${data.message}`);
    });
}

export function createLogger(name) {
    return new LogCreator(name);
}