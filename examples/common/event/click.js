import { Logger } from '../log/logger.js';
import { HandlerBuilder } from './handler.js';
import { HandlerMethod } from './handler-method.js';
import { EventListener } from './handler.js';
import { EventTypeHandlers } from './event-type-handlers.js';
const log = new Logger('ClickHandler');

class ClickHandler extends EventListener {
  constructor() {
    super();
    this.eventTypeHandlers = new EventTypeHandlers();
  }

  getEventTypes() {
    return ['click', 'dblclick', 'mousedown', 'mouseup'];
  }

  callHandlers(event) {
    const type = event.type;
    const continuation = this.DefaultContinuation;

    var clickHandlerType = 'onclick';
    if (event.type == 'click') {
      clickHandlerType = 'click';
    } else if (event.type == 'onmousedown') {
      switch (event.button) {
        case 0:
          clickHandlerType = 'leftclick';
          break;
        case 1:
          clickHandlerType = 'middleclick';
          break;
        case 2:
          clickHandlerType = 'rightclick';
          break;
      }
    } else if (event.type == 'dblclick') {
      clickHandlerType = 'dblclick';
    }
    const target = this.getEventTarget(event);
    const handlers =
      this.eventTypeHandlers.getHandlersByType(clickHandlerType) ?? [];
    handlers.forEach((handler) => {
      continuation.replace(handler.call(this, event, target));
    });
    return continuation;
  }
  addHandler(type, handler) {
    this.eventTypeHandlers.add(type, handler);
  }
}

class ClickHandlerBuilder extends HandlerBuilder {
  constructor(handler = null) {
    super(handler ?? new ClickHandler());
  }

  onClick(...handler) {
    this.eventHandler.addHandler(
      'click',
      new HandlerMethod(...handler, 'onClick')
    );
    return this;
  }

  onDoubleClick(...handler) {
    this.eventHandler.addHandler(
      'dblclick',
      new HandlerMethod(...handler, 'onDoubleClick')
    );
    return this;
  }

  onLeftClick(...handler) {
    this.eventHandler.addHandler(
      'leftclick',
      new HandlerMethod(...handler, 'onLeftClick')
    );
    return this;
  }
}

function BuildClickListener() {
  return new ClickHandlerBuilder();
}

export { BuildClickListener, ClickHandlerBuilder, ClickHandler };
