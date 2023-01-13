import { Logger } from "../log/logger.js";
import { EventTypeHandlers } from "./event-type-handlers.js";
import { HandlerMethod } from "./handler-method.js";
import { EventHandler, HandlerBuilder } from "./handler.js";
const log = new Logger("MouseHandler");

const eventTypes = [
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "mousemove",
  "mouseover",
  "mousewheel",
  "mouseout",
  "contextmenu",
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
    if (event != null) {
      var target = event.currentTarget;
      this.width = target.clientWidth;
      this.height = target.clientHeight;
      this.x = event.offsetX;
      this.y = event.offsetY;
      this.pctX = this.width > 0 ? (this.x * 1.0) / this.width : 0;
      this.pctY = this.height > 0 ? (this.y * 1.0) / this.height : 0;
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
class MouseHandler extends EventHandler {
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
      continuation.merge(handler.call(this, event, target, mousePosition));
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
      "onmousemove",
      new HandlerMethod(...handler, "onMouseMove")
    );
    return this;
  }

  onMouseDown(...handler) {
    this.eventHandler.addHandler(
      "onmousedown",
      new HandlerMethod(...handler, "onMouseDown")
    );
    return this;
  }
}

function BuildMouseListener() {
  return new MouseHandlerBuilder();
}

export { BuildMouseListener, MouseHandlerBuilder, MouseHandler };
