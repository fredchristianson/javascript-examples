import { DEFAULT_LOG_LEVEL, LogLevel, LogMessage } from "./common.js";
import { LogFormatter } from "./log-formatter.js";

// export everything in common.js.  most clients will want LogLevel
export * from "./common.js";

const DEFAULT_LOG_FORMATTER = new LogFormatter();
const destinations = [];

export class LogDestination {
  constructor(level, formatter = DEFAULT_LOG_FORMATTER) {
    this.level = level;
    this.formatter = formatter;
    destinations.push(this);
  }
  setFormatter(formatter) {
    this.formatter = formatter;
  }

  write(message) {
    if (message instanceof LogMessage) {
      if (this.level == null || this.level.isWanted(message.getLevel())) {
        const text = this.formatter.format(message);
        this.writeLine(text, message);
      }
    } else {
      console.error("LogDestination.write requires a LogMessage parameter");
    }
  }
  writeLine(text, logMessage) {
    alert("derived LogDestination class must implement writeLine()");
  }
}

export class ConsoleDestination extends LogDestination {
  constructor(level = DEFAULT_LOG_LEVEL, formatter = DEFAULT_LOG_FORMATTER) {
    super(level, formatter);
  }
  writeLine(text, logMessage) {
    if (logMessage.getLevel().getValue() <= LogLevel.ERROR.getValue()) {
      console.error(text);
    } else if (logMessage.getLevel().getValue() <= LogLevel.WARN.getValue()) {
      console.warn(text);
    } else if (logMessage.getLevel().getValue() <= LogLevel.INFO.getValue()) {
      console.info(text);
    } else {
      console.log(text);
    }
  }
}

export class DOMDestination extends LogDestination {
  constructor(
    container,
    level = DEFAULT_LOG_LEVEL,
    formatter = DEFAULT_LOG_FORMATTER
  ) {
    super(level, formatter);
    this.domElement = null;
    if (typeof container == "string") {
      // try to find the container using the value as an element ID
      this.domElement = document.getElementById(container);
      if (this.domElement == null) {
        // not found as element ID so try as a selector
        this.domElement = document.querySelector(container);
      }
    } else if (container instanceof HTMLElement) {
      this.domElement = container;
    } else if (typeof container == "function") {
      this.domElement = container();
    }
    this.historySize = 100;
  }

  setHistorySize(size) {
    this.historySize = size;
  }

  writeLine(text, logMessage) {
    if (this.domElement == null) {
      return;
    }
    while (
      this.historySize > 0 &&
      this.domElement.childElementCount >= this.historySize
    ) {
      this.domElement.removeChild(this.domElement.firstChild);
    }
    const element = document.createElement("div");
    const level = logMessage.getLevel().getName();
    element.className = `log ${level}`;
    element.innerHTML = text;
    this.domElement.appendChild(element);
    this.domElement.scrollTo(0, this.domElement.scrollHeight);
  }
}

function createDefaultDestinations() {
  if (typeof console == "object") {
    const consoleDestination = new ConsoleDestination();
  }
  if (document.getElementById("LOG-CONTAINER") != null) {
    const domDestination = new DOMDestination("LOG-CONTAINER");
  }
}

export function writeMessage(message) {
  if (destinations.length == 0) {
    createDefaultDestinations();
  }
  for (var dest of destinations) {
    dest.write(message);
  }
}

export default writeMessage;
