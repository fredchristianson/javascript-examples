import { namespace } from './child-window-namespace.js';
import { BrowserWindow } from './window-manager.js';

import { createLogger } from "./logger.js";
const log = createLogger("Window");

/**
 * Gives a child window access to it's parent's DOM for manipulation
 * and listening to events
 *
 * @class ParentWindow
 * @typedef {ParentWindow}
 * @extends {BrowserWindow}
 */
class ParentWindow extends BrowserWindow {
    constructor() {
        super();

    }


}

/**
 * Return the ParentWindow if it has already been created.  Create it if needed.
 *
 * @returns {ParentWindow}
 */
export function getParentWindow() {
    if (namespace.parent == null) {
        namespace.parent = new ParentWindow(window.opener);
        namespace.parent._setWindow(window.opener);

    }

    return namespace.parent;
}
