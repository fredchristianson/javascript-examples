import { Logger } from '../log/logger.js';
import { EventTypeHandlers } from './event-type-handlers.js';
import { HandlerMethod } from './handler-method.js';
import { EventListener, HandlerBuilder } from './handler.js';
const log = new Logger('MouseHandler');

const eventTypes = [
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'mousemove',
  'mouseover',
  'wheel',
  'mouseout',
  'contextmenu'
];

class MousePosition {
  constructor(event = null) {
    this.event = event;
    this.x = 0;
    this.y = 0;
    this.pctX = 0;
    this.pctY = 0;
    this.update(event);
  }

  update(event) {
    this.event = event;
    var target = event?.currentTarget ?? event.target;
    if (target != null) {
      this.width = target.clientWidth;
      this.height = target.clientHeight;
      this.x = event.offsetX;
      this.y = event.offsetY;
      this.pctX = this.width > 0 ? (this.x * 1.0) / this.width : 0;
      this.pctY = this.height > 0 ? (this.y * 1.0) / this.height : 0;
    } else {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.pctX = 0;
      this.pctY = 0;
    }
  }

  // pctX and pctY are [0...1].
  // xPercent() and yPercent() are integers [0...100]
  xPercent() {
    return Math.floor(this.pctX * 100);
  }
  yPercent() {
    return Math.floor(this.pctY * 100);
  }
}
class MouseHandler extends EventListener {
  constructor() {
    super();
    this.eventTypeHandlers = new EventTypeHandlers();
  }
  getEventTypes() {
    return eventTypes;
  }

  callHandlers(event) {
    const continuation = super.DefaultContinuation;
    const mousePosition = new MousePosition(event);
    const handlers = this.eventTypeHandlers.getHandlersByType(event.type);
    handlers.forEach((handler) => {
      if (event.type == 'mousewheel') {
        const distance = { deltaX: event.deltaX, deltaY: event.deltaY };
        continuation.replace(handler.call(this, event, distance));
      } else {
        continuation.replace(handler.call(this, event, mousePosition));
      }
    });
    return continuation;
  }

  addHandler(type, handler) {
    this.eventTypeHandlers.add(type, handler);
  }
}

class MouseHandlerBuilder extends HandlerBuilder {
  constructor() {
    super(new MouseHandler());
  }

  onMouseMove(...handler) {
    this.eventHandler.addHandler(
      'mousemove',
      new HandlerMethod(...handler, 'onMouseMove')
    );
    return this;
  }

  onMouseDown(...handler) {
    this.eventHandler.addHandler(
      'mousedown',
      new HandlerMethod(...handler, 'onMouseDown')
    );
    return this;
  }

  onMouseUp(...handler) {
    this.eventHandler.addHandler(
      'mouseup',
      new HandlerMethod(...handler, 'onMouseUp')
    );
    return this;
  }

  onMouseOver(...handler) {
    this.eventHandler.addHandler(
      'mouseover',
      new HandlerMethod(...handler, 'onMouseOver')
    );
    return this;
  }

  onMouseOut(...handler) {
    this.eventHandler.addHandler(
      'mouseout',
      new HandlerMethod(...handler, 'onMouseOut')
    );
    return this;
  }

  onMouseWheel(...handler) {
    this.eventHandler.addHandler(
      'wheel',
      new HandlerMethod(...handler, 'onMouseWheel')
    );
    return this;
  }
}

function BuildMouseListener() {
  return new MouseHandlerBuilder();
}

export { BuildMouseListener, MouseHandlerBuilder, MouseHandler };
