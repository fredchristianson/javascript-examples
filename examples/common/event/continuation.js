import { Logger } from '../log/logger.js';
const log = new Logger('EventContinuation');

class Continuation {
  static get Continue() {
    return new Continuation(false, false, false);
  }
  static get StopPropagation() {
    return new Continuation(true, false, false);
  }
  static get StopPropagationImmedate() {
    return new Continuation(true, true, false);
  }
  static get StopDefault() {
    return new Continuation(false, false, true);
  }
  static get Cancel() {
    return new Continuation(true, true, true);
  }

  constructor(stopPropagation, stopImmediate, preventDefault) {
    this.stopPropagation = stopPropagation;
    this.stopImmediate = stopImmediate;
    this.preventDefault = preventDefault;
  }

  replace(other) {
    if (other == null || !(other instanceof Continuation)) {
      // do nothing if the parameter isn't Continuation
      return;
    }
    this.stopImmediate = other.stopImmediate;
    this.stopPropagation = other.stopPropagation;
    this.preventDefault = other.preventDefault;
  }

  finishEvent(event) {
    if (this.stopPropagation) {
      if (this.stopImmediate) {
        event.stopImmediatePropagation();
      } else {
        event.stopPropagation();
      }
    }
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
}

export { Continuation };
