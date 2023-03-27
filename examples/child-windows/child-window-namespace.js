
const NAME = "_example_child_windows";

if (window[NAME] == null) {
    window[NAME] = {
        name: NAME
    };
}

export const namespace = window[NAME];