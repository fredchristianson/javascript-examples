import { Logger } from "../log/logger.js";
const log = new Logger("EventHandler");

class HandlerMethod {
  constructor(object, method, defaultMethodName = null) {
    if (typeof object == "function") {
      // passed a simple function so it is the method
      this.object = null;
      this.method = object;
    } else if (typeof object == "object") {
      this.object = object;

      if (typeof method == "function") {
        this.method = method;
      } else {
        this.method = this.findMethod(this.object, method, defaultMethodName);
      }
    } else {
      this.object = null;
      this.method = null;
    }
    if (this.method == null) {
      throw new Error("HandlerMethod requires a funciton or object and method");
    }
  }

  findMethod(object, method, defaultMethod) {
    var found = null;
    if (method != null && typeof method == "string") {
      found = object[method];
    }
    if (found == null && typeof defaultMethod == "string") {
      found = object[defaultMethod];
    }
    return found;
  }

  call(handler, event, ...args) {
    const continuation = handler.DefaultContinuation;
    var target = handler.getEventTarget(event);
    var dataSource = handler.getDataSource();
    if (this.method) {
      try {
        if (dataSource) {
          var data = dataSource;
          if (typeof dataSource == "function") {
            data = dataSource(event);
          }

          continuation.merge(
            this.method.call(this.object, data, ...args, target, event, handler)
          );
        } else {
          continuation.merge(
            this.method.call(this.object, ...args, target, event, handler)
          );
        }
      } catch (ex) {
        log.error(ex, "event handler failed");
      }
    }
    return continuation;
  }
}

export { HandlerMethod };
