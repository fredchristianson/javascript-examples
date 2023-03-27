export const LOGLEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};



/**
 * write a log message to the console of the main windows.  Child windows use 
 * window.opener.postMessage to send the message to the main window.
 * 
 * The main window listens for "message" events and writes the message
 *
 * @class Logger
 * @typedef {Logger}
 */
class Logger {
    /**
     * Creates an instance of Logger.
     *
     * @constructor
     * @param {ScrollSetting} name - name of the module logging a message
     * @param {number} [level=LOGLEVEL.DEBUG] - level of messages wanted (DEBUG,INFO,WARN,ERROR)
     */
    constructor(name, level = LOGLEVEL.DEBUG) {
        this._name = name;
        this._level = level;
    }

    /**
     * write a debug level message
     *
     * @param {String} message
     */
    debug(message) {
        if (this._level >= LOGLEVEL.DEBUG) {
            this.writeMessage(message, "debug");
        }
    }


    /**
     * write an info level message
     *
     * @param {String} message
     */
    info(message) {
        if (this._level >= LOGLEVEL.INFO) {
            this.writeMessage(message, "info");
        }
    }


    /**
     * write a warn level message
     *
     * @param {String} message
     */
    warn(message) {
        if (this._level >= LOGLEVEL.WARN) {
            this.writeMessage(message, "warn");
        }
    }


    /**
     * write an error level message
     *
     * @param {String} message
     */
    error(message) {
        this.writeMessage(message, "error");
    }

    /**
     * Write the message to the javascript console if this is the main window.
     * 
     * Post the message to the main window if this is a chile window.
     *
     * @param {*} message
     * @param {*} level
     */
    writeMessage(message, level) {

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

/**
 * Create a Logger to write messages for a module
 *
 * @export
 * @param {String} name of the module logging messages
 * @returns {Logger}
 */
export function createLogger(name) {
    return new Logger(name);
}