import { Logger } from "../../common/log/logger.js";
const log = Logger.create("WebGL.Program");

class Program {
    static create(gl, vertexShader, fragmentShader) {
        return new Program(gl, vertexShader, fragmentShader);
    }

    #gl = null;
    #vertexShader = null;
    #fragmentShader = null;
    #glProgram = null;

    constructor(gl, vertexShader, fragmentShader) {
        this.#gl = gl;
        this.#vertexShader = vertexShader;
        this.#fragmentShader = fragmentShader;

        this.#glProgram = gl.createProgram();
        this.#vertexShader.compile(this.#gl, this);
        this.#fragmentShader.compile(this.#gl, this);

        this.#gl.linkProgram(this.#glProgram);
        this.#gl.useProgram(this.#glProgram);
        this.#vertexShader.setup(this.#gl, this.#glProgram);
        this.#fragmentShader.setup(this.#gl, this.#glProgram);
        log.debug('vertex shader:', gl.getShaderInfoLog(this.#vertexShader.getGlShader()) || 'OK');
        log.debug('fragment shader:', gl.getShaderInfoLog(this.#fragmentShader.getGlShader()) || 'OK');
        log.debug('program:', gl.getProgramInfoLog(this.#glProgram) || 'OK');



    }

    getGlProgram() { return this.#glProgram; }
}


export { Program }