import { LogLevel, Logger } from "../log/logger.js";
const log = new Logger("Listeners", LogLevel.WARN);

export class Listeners extends Array {
  constructor(...args) {
    super();
    args.forEach((arg) => {
      this.push(arg);
    });
  }

  add(...args) {
    args.forEach((arg) => {
      this.push(arg);
    });
  }

  removeAll() {
    while (this.length > 0) {
      this.shift().remove();
    }
  }
}
export default Listeners;
