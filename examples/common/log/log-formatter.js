import { LogLevel, LogMessage } from "./common.js";

export class LogFormatter {
  constructor() {
    this.minModuleLength = 10;
    this.maxModuleLength = 25;
    this.moduleLength = 10;
    this.levelLength = 7;
    this.maxMessageLength = 250;
  }

  setMaxMessageLength(len) {
    this.maxMessageLength = len;
  }
  setMaxModuleLength(len) {
    this.maxModuleLength = len;
  }

  format(logMessage) {
    const time = this.formatTime(logMessage.getTime());
    const level = this.formatLevel(logMessage.getLevel());
    const module = this.formatModule(logMessage.getModuleName());
    const message = this.formatMessageText(logMessage.getText());
    const formatted = this.combine(time, level, module, message);
    return formatted;
  }

  formatTime(time) {
    try {
      if (typeof time == "number") {
        time = new Date(time);
      } else if (typeof time == "string") {
        time = Date.parse(time);
      }
      if (!(time instanceof Date)) {
        time = new Date(time);
      }
      return time
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        })
        .slice(0, -3);
    } catch (ex) {
      return "----";
    }
  }
  formatLevel(level) {
    return level.getName().padEnd(this.levelLength);
  }
  formatModule(moduleName) {
    this.moduleLength = Math.max(moduleName.length, this.moduleLength);
    this.moduleLength = Math.max(this.minModuleLength, this.moduleLength);
    this.moduleLength = Math.min(this.maxModuleLength, this.moduleLength);
    return moduleName
      .padEnd(" ", this.moduleLength)
      .substring(0, this.moduleLength);
  }
  formatMessageText(message) {
    if (message.length > this.maxMessageLength) {
      message = message.substring(0, this.maxMessageLength) + "...";
    }
    return message;
  }
  combine(time, level, module, message) {
    return `${time} | ${level} | ${module}: ${message}`;
  }
}

export default LogFormatter;
