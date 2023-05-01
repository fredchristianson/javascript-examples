import { FragmentShader } from "./fragment-shader.js";

const SHADER_CODE = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}`;


class ColorShader extends FragmentShader {
    #colorLocation = null;

    static create() {
        return new
            ColorShader();
    }
    constructor() {
        super(SHADER_CODE);

    }


    setColors4f(colorArray) {
        this.withGl(gl => {
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(
                this.#colorLocation, // target
                4,
                gl.FLOAT, // type
                false,    // normalize
                0,        // stride
                0         // offset
            );
            gl.enableVertexAttribArray(this.#colorLocation);
        });
    }

    _setupAttributes(gl, program) {
        // this.#colorLocation = gl.getAttribLocation(program, "v_color");
    }
    _setupUniforms(gl, program) {

    }
    _setupVarying(gl, program) {
        //this.#colorLocation = gl.getAttribLocation(program, "v_color");
    }
}

export { ColorShader }