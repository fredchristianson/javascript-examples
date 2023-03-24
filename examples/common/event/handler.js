import { Logger, LogLevel } from '../log/logger.js';
import { Continuation } from './continuation.js';
const log = new Logger('EventListener', LogLevel.ERROR);

class HandlerBuilder {
  constructor(eventHandler = null) {
    if (eventHandler == null) {
      eventHandler = new EventListener();
    }
    this.eventHandler = eventHandler;
    this.listenToElement = document.body;
    this.targetSelectors = [];
    this.eventTypes = null;
  }

  listen(listenElement, targetSelectors = null) {
    if (listenElement instanceof HTMLElement) {
      this.listenToElement = listenElement;
    } else {
      this.listenToElement = document.querySelector(listenElement);
    }
    if (this.listenToElement == null) {
      throw new Error('listen element not found');
    }
    this.targetSelectors = targetSelectors;
    return this;
  }

  debounce() {
    return this.setDebounceMSecs(250);
  }
  setDebounceMSecs(msecs = 250) {
    this.eventHandler.setDebounceMSecs(msecs);
    return this;
  }

  withAlt(require = true) {
    this.eventHandler.requireAlt = require;
    return this;
  }

  withCtrl(require = true) {
    this.eventHandler.requireCtrl = require;
    return this;
  }
  withShift(require = true) {
    this.eventHandler.requireShift = require;
    return this;
  }

  build() {
    this.eventHandler.listen(this.listenToElement);
    this.eventHandler.setTargetSelectors(this.targetSelectors);
    return this.eventHandler;
  }

  /* provide a function that returns true for events that should be processed*/
  filterAllow(filterFunc) {
    if (typeof filterFunc != 'function') {
      throw new Error('filterAllow requires a function parameter');
    }
    this.eventHandler.filterAllow = filterFunc;
    return this;
  }
  /* provide a function that returns true for events that should be processed*/
  filterExclude(filterFunc) {
    if (typeof filterFunc != 'function') {
      throw new Error('filterExclude requires a function parameter');
    }
    this.eventHandler.filterExclude = filterFunc;
    return this;
  }
  setData(data) {
    this.eventHandler.setDataSource(data);
    return this;
  }

  setContinuation(continuation) {
    this.eventHandler.DefaultContinuation = continuation;
    return this;
  }
  createEventHandler() {
    throw new Error('derived class must implement createEventHandler');
  }
}

class EventListener {
  constructor() {
    this.listenerMethod = this.handleEvent.bind(this);
    this.element = null;
    this.targetSelectors = null;
    this.eventTypes = [];
    this.debounceMSecs = null;
    this.debounceTimer = null;
    this.data = null;
    this.RequireAlt = false;
    this.RequireCtrl = false;
    this.RequireShift = false;
    this.filterAllow = null;
    this.filterExclude = null;

    this._defaultContinuation = Continuation.Continue;
    this._eventTypeListenOptions = {};
  }

  listen(element) {
    this.eventTypes = this.getEventTypes();
    if (typeof this.eventTypes == 'string') {
      this.eventTypes = [this.eventTypes];
    }
    if (this.eventTypes == null) {
      log.warn('EventListener does not have any event types');
      return;
    }
    if (typeof element == 'string') {
      this.element = document.querySelector(element);
    } else {
      this.element = element;
    }
    this.eventTypes.forEach((type) => {
      const listenOption = this.getEventOptions(type);
      this._eventTypeListenOptions[type] = listenOption;
      this.element.addEventListener(type, this, listenOption);
    });
  }

  set DefaultContinuation(continuation) {
    this._defaultContinuation = continuation;
  }
  get DefaultContinuation() {
    return this._defaultContinuation;
  }
  setDataSource(data) {
    this.data = data;
  }
  getDataSource() {
    return this.data;
  }
  setDebounceMSecs(msecs) {
    this.debounceMSecs = msecs;
  }
  setTargetSelectors(selectors) {
    if (selectors == null) {
      this.targetSelectors = selectors;
    } else if (!Array.isArray(selectors)) {
      this.targetSelectors = [selectors];
    } else {
      this.targetSelectors = selectors;
    }
  }

  isContained(element, ancestor) {
    var found = element;
    while (found != null && found != ancestor) {
      found = found.parentNode;
    }
    return found != null;
  }
  getEventTarget(event) {
    // if there aren't any targetSelectors, return currentTarget
    if (this.targetSelectors == null) {
      return event.currentTarget;
    }
    // custom events may not have a target
    if (event.target == null) {
      return null;
    }
    // if the event target matches any selector, return it
    for (var sel of this.targetSelectors) {
      if (event.target.matches(sel)) {
        return event.target;
      }
    }
    // find a selector in the DOM hierarchy between the target and currentTarget
    // gives listeners a lot of flexibility on which element they get as the target
    for (var parentSel of this.targetSelectors) {
      const closest = event.target.closest(parentSel);
      if (closest != null && this.isContained(closest, event.currentTarget)) {
        return closest;
      }
    }
    // couldn't find a better option so return currentTarget
    return event.currentTarget;
  }
  /* if targetSelectors exist, the event target must
   *  match one of them.
   */
  selectorMismatch(event) {
    if (this.targetSelectors == null) {
      return false;
    }
    const match = this.targetSelectors.find((selector) => {
      try {
        var isMatch = event.target.matches(selector);
        if (!isMatch) {
          const closest = event.target.closest(selector);
          isMatch = this.isContained(closest, event.currentTarget);
        }
        return isMatch;
      } catch (err) {
        return false;
      }
    });
    return !match;
  }

  /* if alt,ctrl, or shift is required, the event must have the flag true.
   *    events where keyboard flags are undefined, are never allowed.
   */
  keyMismatch(event) {
    if (typeof event.altKey == 'undefined') {
      return false; // never allow
    }
    if (this.requireAlt && !event.altKey) {
      return true;
    }
    if (this.requireCtrl && !event.ctrlKey) {
      return true;
    }
    if (this.requireShift && !event.shiftKey) {
      return true;
    }
    return false;
  }

  filterFail(event) {
    return (
      (this.filterAllow != null && !this.filterAllow(event)) ||
      (this.filterExclude != null && this.filterExclude(event))
    );
  }
  handleEvent(event) {
    log.never(`handle event ${event.type}`);
    if (
      this.selectorMismatch(event) ||
      this.keyMismatch(event) ||
      this.filterFail(event)
    ) {
      return;
    }

    if (this.debounceMSecs > 0) {
      if (this.debounceTimer) {
        log.never('clearTimout');
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        log.never('in timeout ', event.type);
        this.invokeHandler(event);
        this.debounceTimer = null;
      }, this.debounceMSecs);
      log.never('timeoutSet ');
    } else {
      this.invokeHandler(event);
    }
  }

  invokeHandler(event) {
    const result = this.callHandlers(event);
    result.finishEvent(event);
  }

  callHandlers(event) {
    throw new Error('derived class must implement callHandlers');
  }
  remove() {
    this.eventTypes.forEach((type) => {
      this.element.removeEventListener(
        type,
        this,
        this._eventTypeListenOptions[type]
      );
    });
  }

  getEventTypes() {
    throw new Error('derived class must implement getEventTypes()');
  }

  getEventOptions(type) {
    // derived class may specify options for each type (e.g. once, capture, passive)
    return null;
  }
}

export { HandlerBuilder, EventListener };
