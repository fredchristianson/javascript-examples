import { Logger } from "../common/log/logger.js";
const log = new Logger("Mouse");

function mouseOver(event) {
  log.error(`mouseOver (${event.clientX},${event.clientY})`);
}

function mouseOut(event) {
  log.error(`mouseOut (${event.clientX},${event.clientY})`);
}
function mouseEnter(event) {
  log.info(`mouseEnter (${event.clientX},${event.clientY})`);
}
function mouseLeave(event) {
  log.info(`mouseLeave (${event.clientX},${event.clientY})`);
}
function mouseMove(event) {
  log.debug(`mouseMove (${event.clientX},${event.clientY})`);
}
function mouseDown(event) {
  log.warn(`mouseDown (${event.clientX},${event.clientY})`);
}
function mouseUp(event) {
  log.always(`mouseUp (${event.clientX},${event.clientY})`);
}

export class MouseModule {
  constructor(elementID) {
    this.element = document.getElementById(elementID);
    this.element.addEventListener("mouseover", mouseOver);
    this.element.addEventListener("mouseout", mouseOut);
    this.element.addEventListener("mouseenter", mouseEnter);
    this.element.addEventListener("mouseleave", mouseLeave);
    this.element.addEventListener("mousemove", mouseMove);
    this.element.addEventListener("mousedown", mouseDown);
    this.element.addEventListener("mouseup", mouseUp);
  }

  getLogger() {
    return log;
  }
}

export default MouseModule;
