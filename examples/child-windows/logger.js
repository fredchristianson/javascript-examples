export const LOGLEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

let _logManager = null;

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
        if (window.opener == null && _logManager == null) {
            // if _logManager is not initialized we can only write to the console.
            console.log(message);
        } else {
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
}

export function setLogManager(logManager) {
    _logManager = logManager;
}
export function createLogger(name) {
    return new LogCreator(name);
}