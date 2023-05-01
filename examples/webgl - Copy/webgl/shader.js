

class Shader {
    #code = null;
    #glShader = null;
    #program = null;
    #gl = null;
    #glProgram = null;

    constructor(code) {
        this.#code = code;
    }

    compile(gl, program) {
        this.#gl = gl;
        this.#program = program;
        this.#glProgram = program.getGlProgram();

        this.#glShader = gl.createShader(this._getType(gl));
        gl.shaderSource(this.#glShader, this.#code);
        gl.compileShader(this.#glShader);
        gl.attachShader(program.getGlProgram(), this.#glShader);
    }

    getGlShader() { return this.#glShader; }

    setup(gl, program) {
        this._setupAttributes(gl, program);
        this._setupUniforms(gl, program);
        this._setupVarying(gl, program);
    }

    withGl(func) { func(this.#gl); }
    _getType() {
    }
}

export { Shader };