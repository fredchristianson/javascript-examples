import { Shader } from "./shader.js";

class VertexShader extends Shader {
    constructor(code) {
        super(code);
    }

    _setupAttributes(_gl, _program) { }
    _setupUniforms(_gl, _program) { }
    _setupVarying(_gl, _program) { }
}

export { VertexShader };