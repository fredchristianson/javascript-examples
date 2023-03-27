

export async function run() {
    const createChildWindow = (await import('./child-windows.js')).createChildWindow;
    const createLogger = (await import('./logger.js')).createLogger;
    const createLogManager = (await import('./log-manager.js')).createLogManager;
    const logManager = await createLogManager();
    let log = createLogger("Main");
    log.debug("Running");
    log.info("info message");
    log.warn("warn message");
    log.error("error message");
    let controlWindow = null;
    let drawWindow = null;

    const stopButton = document.getElementById('stop');
    const startButton = document.getElementById('start');

    function rotateText(event) {
        const value = event.target.value - 180;
        log.info(`rotate: ${value}`);

        const textElement = drawWindow.querySelector('.draw-text');
        const transform = `rotate(${value}deg)`;
        textElement.style.transform = transform;

    }

    function changeText(event) {
        const value = event.target.value;
        log.info(`change text: ${value}`);
        const textElement = drawWindow.querySelector('.draw-text');
        textElement.innerText = value;
    }

    function createControlListeners() {
        controlWindow.querySelector(`input[name='rotation']`)
            .addEventListener('input', rotateText);
        controlWindow.querySelector(`input[name='text']`)
            .addEventListener('input', changeText);
    }

    function closeWindows() {
        log.info("close windows");
        controlWindow?.close();
        drawWindow?.close();
        startButton.parentElement.classList.remove('hide');
        stopButton.parentElement.classList.add('hide');
    }

    async function openWindows() {
        log.info("open windows");

        drawWindow = await createChildWindow("Draw", "draw.html");
        controlWindow = await createChildWindow("Control", "control.html");
        createControlListeners();
        startButton.parentElement.classList.add('hide');
        stopButton.parentElement.classList.remove('hide');

        drawWindow.addCloseHandler(closeWindows);
        controlWindow.addCloseHandler(closeWindows);
    }

    startButton.addEventListener('click', () => {
        closeWindows();
        openWindows();
    });

    stopButton.addEventListener('click', () => {
        closeWindows();
    });

    window.addEventListener('xbeforeunload', () => {
        try {
            console.log('closing');
            logManager?.close();
            controlWindow?.close();
            drawWindow?.close();
            console.log('child windows closed');
            return true;
        } catch (ex) {
            console.log("cannot close windows ", ex);
        }
    });

}