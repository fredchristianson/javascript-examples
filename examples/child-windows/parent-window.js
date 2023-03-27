import { namespace } from './child-window-namespace.js';
import { globalWindow, openerWindow, BrowserWindow } from './window-manager.js';

import { createLogger } from "./logger.js";
const log = createLogger("Window");

class ParentWindow extends BrowserWindow {
    constructor() {
        super();

    }


}

export function getParentWindow() {
    if (namespace.parent == null) {
        namespace.parent = new ParentWindow(openerWindow);
        namespace.parent.setWindow(openerWindow);

    }

    return namespace.parent;
}
