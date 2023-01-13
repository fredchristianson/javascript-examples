import { Logger } from "../log/logger.js";
import { HandlerMethod } from "./handler-method.js";
import { HandlerBuilder } from "./handler.js";
import { InputHandler, InputHandlerBuilder } from "./input.js";
const log = new Logger("CheckboxHandler");

class CheckboxHandler extends InputHandler {
  constructor() {
    super();
    this.onCheckedHandlers = [];
    this.onUncheckedHandlers = [];
  }

  getValue(event) {
    return event.target.checked;
  }
  callHandlers(event) {
    const continuation = super.callHandlers(event);
    if (event.type == "input") {
      if (this.getValue(event)) {
        this.onCheckedHandlers.forEach((handler) => {
          continuation.merge(handler.call(this, event));
        });
      } else {
        this.onUncheckedHandlers.forEach((handler) => {
          continuation.merge(handler.call(this, event));
        });
      }
    }
    return continuation;
  }
}

class CheckboxHandlerBuilder extends InputHandlerBuilder {
  constructor() {
    super(new CheckboxHandler());
  }

  onChecked(...handler) {
    this.eventHandler.onCheckedHandlers.push(
      new HandlerMethod(...handler, "onChecked")
    );
    return this;
  }
  onUnchecked(...handler) {
    this.eventHandler.onUncheckedHandlers.push(
      new HandlerMethod(...handler, "onUnchecked")
    );
    return this;
  }
}

function BuildCheckboxListener() {
  return new CheckboxHandlerBuilder();
}

export { BuildCheckboxListener, CheckboxHandlerBuilder };
