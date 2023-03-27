/** @fileoverview - create a namespace for data we can attach to the 
 * global window object. 
 * 
 * window._example_child_windows is an object we can safely add 
 * data to (assuming no other library creates that property)
 */
const NAME = "_example_child_windows";

if (window[NAME] == null) {
    window[NAME] = {
        name: NAME
    };
}

export const namespace = window[NAME];