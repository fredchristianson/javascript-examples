import { FragmentShader } from "./fragment-shader.js";

const SHADER_CODE = `
precision mediump float;
uniform vec4 color;
void main() {
  gl_FragColor = color;
}`;

class SolidColorShader extends FragmentShader {
    #colorLocation = null;

    static create() {
        return new SolidColorShader();
    }
    constructor() {
        super(SHADER_CODE);

    }

    setColor(r, g, b) {
        this.withGl(gl => {
            gl.uniform4f(this.#colorLocation, r, g, b, 1);
        });
    }

    _setupAttributes(gl, program) {
        this.#colorLocation = gl.getUniformLocation(program, "color");
    }
}

export { SolidColorShader }