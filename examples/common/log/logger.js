import { writeMessage } from "./log-destination.js";

import { DEFAULT_LOG_LEVEL, LogLevel, LogMessage } from "./common.js";
export { DEFAULT_LOG_LEVEL, LogLevel, LogMessage } from "./common.js";

export class Logger {
  constructor(name, level = DEFAULT_LOG_LEVEL) {
    this.name = name;
    this.level = level;
  }
  setLevel(level) {
    this.level = LogLevel.get(level);
  }

  getLevel() {
    return this.level;
  }
  write(level, ...text) {
    if (this.level.isWanted(level)) {
      const message = new LogMessage(this.name, level, ...text);
      writeMessage(message);
      //console.log(`${level.getName()} - ${this.name}:${text}`);
    }
  }
  debug(...text) {
    this.write(LogLevel.DEBUG, ...text);
  }
  info(...text) {
    this.write(LogLevel.INFO, ...text);
  }
  warn(...text) {
    this.write(LogLevel.WARN, ...text);
  }
  error(...text) {
    this.write(LogLevel.ERROR, ...text);
  }
  always(...text) {
    this.write(LogLevel.ALWAYS, ...text);
  }
  never(...text) {
    /* do nothing */
  }
}

export default Logger;
