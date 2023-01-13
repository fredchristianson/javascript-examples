// LogLevel values are 0-100.
// Every message and destination have a level.
// If the message level is less than or equal to the destination, the message is written
// For esample, message level 60 (WARN) will be written to
// destations at levels 60(WARN), 80(INFO), and 100(DEBUG), but not to 40(ERROR).
// Level 0(ALWAYS) and -1(NEVER) have special meanings and do what they say.

class LogLevel {
  static get(level) {
    if (typeof level == "string") {
      level = level.toUpperCase();
    }
    if (level == 100 || level == "DEBUG") {
      return LogLevel.DEBUG;
    }
    if (level == 80 || level == "INFO") {
      return LogLevel.INFO;
    }
    if (level == 60 || level == "WARN") {
      return LogLevel.WARN;
    }
    if (level == 40 || level == "ERROR") {
      return LogLevel.ERROR;
    }
    if (level == 0 || level == "ALWAYS") {
      return LogLevel.ALWAYS;
    }
    if (level == -1 || level == "NEVER") {
      return LogLevel.NEVER;
    }
    if (!isNaN(level)) {
      return new LogLevel(level, level);
    } else {
      return new LogLevel(100, level);
    }
  }
  constructor(value, name) {
    this.value = parseInt(value);
    if (isNaN(this.value)) {
      this.value = 100;
    }
    this.name = name;
  }

  getValue() {
    return this.value;
  }
  getName() {
    return this.name;
  }

  // return true if
  // * this is ALWAYS and messageLevel is not NEVER
  // * this value is greater or equal to messageLevel value
  isWanted(messageLevel) {
    if (this.value >= messageLevel.getValue()) {
      return true;
    }
    return (
      this.value == LogLevel.ALWAYS.getValue() &&
      messageLevel.getValue() != LogLevel.NEVER.getValue()
    );
  }
}

class LogMessage {
  constructor(moduleName, level, ...text) {
    this.moduleName = moduleName;
    this.level = level;
    this.text = this.combineTextParts(text);
    // log time is stored so these can be sent asynchronously
    this.time = Date.now();
  }

  getModuleName() {
    return this.moduleName;
  }
  getLevel() {
    return this.level;
  }
  getText() {
    return this.text;
  }
  getTime() {
    return this.time;
  }

  combineTextParts(parts) {
    if (parts == null) {
      return "";
    }
    const stringParts = [];
    parts.forEach((part) => {
      if (part == null) {
        stringParts.push("--null--");
      }
      if (part instanceof HTMLElement) {
        const tag = part.tagName;
        const id = part.id != null && part.id.length > 0 ? `#${part.id}` : "";
        const className =
          part.classList.length > 0 ? `.${[...part.classList].join(".")}` : "";
        const elementText = `<${part.tagName}${id}${className}>`;
        stringParts.push(elementText);
      } else if (typeof part == "object") {
        const json = JSON.stringify(part, null, 4);
        stringParts.push(json);
      } else {
        stringParts.push(part);
      }
    });
    return stringParts.join(" ");
  }
}

LogLevel.DEBUG = new LogLevel(100, "DEBUG");
LogLevel.INFO = new LogLevel(80, "INFO");
LogLevel.WARN = new LogLevel(60, "WARN");
LogLevel.ERROR = new LogLevel(40, "ERROR");
LogLevel.ALWAYS = new LogLevel(0, "ALWAYS");
LogLevel.NEVER = new LogLevel(-1, "NEVER");

var DEFAULT_LOG_LEVEL = new LogLevel(100, "DEBUG");
export { LogLevel, LogMessage, DEFAULT_LOG_LEVEL };
export default LogLevel;
