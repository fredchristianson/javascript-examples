import { Shader } from "./shader.js";

class FragmentShader extends Shader {
    constructor(code) {
        super(code);
    }

    _setupAttributes(_gl, _program) { }
    _setupUniforms(_gl, _program) { }
    _setupVarying(_gl, _program) { }

    _getType(gl) {

        return gl.FRAGMENT_SHADER;
    }

}

export { FragmentShader };