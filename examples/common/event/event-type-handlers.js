import { LogLevel, Logger } from "../log/logger.js";
const log = new Logger("EventTypeHandlers", LogLevel.WARN);

class EventTypeHandler {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
  get Type() {
    return this.type;
  }
  get Handler() {
    return this.handler;
  }
}

class EventTypeHandlers {
  constructor() {
    this.handlers = [];
  }

  add(type, handler) {
    this.handlers.push(new EventTypeHandler(type, handler));
  }

  getHandlersByType(type) {
    return this.handlers
      .filter((withType) => {
        return withType.Type == type;
      })
      .map((typeHandler) => {
        return typeHandler.Handler;
      });
  }
}

export { EventTypeHandlers };
