import { Logger } from '../log/logger.js';
import { HandlerBuilder } from './handler.js';
import { HandlerMethod } from './handler-method.js';
import { EventListener } from './handler.js';
const log = new Logger('InputHandler');

class InputHandler extends EventListener {
  constructor() {
    super();
    this.onChangeHandlers = [];
    this.onInputHandlers = [];
    this.onFocusHandlers = [];
    this.onBlurHandlers = [];
    this.onFocusInHandlers = [];
    this.onFocusOutHandlers = [];
  }

  getEventTypes() {
    return ['change', 'input', 'focus', 'blur', 'focusin', 'focusout'];
  }
  getValue(event) {
    return event.target.value;
  }

  callHandlers(event) {
    const type = event.type;
    const continuation = this.DefaultContinuation;
    if (type == 'change') {
      this.onChangeHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event, this.getValue(event)));
      });
    } else if (type == 'input') {
      this.onInputHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event, this.getValue(event)));
      });
    } else if (type == 'focus') {
      this.onFocusHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event));
      });
    } else if (type == 'blur') {
      this.onBlurHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event));
      });
    } else if (type == 'focusIn') {
      this.onFocusInHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event));
      });
    } else if (type == 'focusOut') {
      this.onFocusOutHandlers.forEach((handler) => {
        continuation.replace(handler.call(this, event));
      });
    }
    return continuation;
  }
}

class InputHandlerBuilder extends HandlerBuilder {
  constructor(handler = null) {
    super(handler ?? new InputHandler());
  }

  onChange(...handler) {
    this.eventHandler.onChangeHandlers.push(
      new HandlerMethod(...handler, 'onChange')
    );
    return this;
  }

  onInput(...handler) {
    this.eventHandler.onInputHandlers.push(
      new HandlerMethod(...handler, 'onInput')
    );
    return this;
  }
  onFocus(...handler) {
    this.eventHandler.onFocusHandlers.push(
      new HandlerMethod(...handler, 'onFocus')
    );
    return this;
  }
  onBlur(...handler) {
    this.eventHandler.onBlurHandlers.push(
      new HandlerMethod(...handler, 'onBlur')
    );
    return this;
  }

  onFocusIn(...handler) {
    this.eventHandler.onFocusInHandlers.push(
      new HandlerMethod(...handler, 'onFocusIn')
    );
    return this;
  }
  onFocusOut(...handler) {
    this.eventHandler.onFocusOutHandlers.push(
      new HandlerMethod(...handler, 'onFocusOut')
    );
    return this;
  }
}

function BuildInputListener() {
  return new InputHandlerBuilder();
}

export { BuildInputListener, InputHandlerBuilder, InputHandler };
