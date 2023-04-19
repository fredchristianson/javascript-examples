import { VertexShader } from "./vertex-shader.js";

const SHADER_CODE = `
attribute vec4 position;
attribute float size;
void main() {
  gl_Position = position;
  gl_PointSize = size;
}`;

class PointShader extends VertexShader {
    static create() {
        return new PointShader();
    }

    #positionLocation = null;
    #sizeLocation = null;

    constructor() {
        super(SHADER_CODE);

    }

    setPosition(x, y, z) {
        this.withGl(gl => {
            gl.vertexAttrib4f(this.#positionLocation, x, y, z, 1);
        });
    }


    setSize(size) {
        this.withGl(gl => {
            gl.vertexAttrib1f(this.#sizeLocation, size);
        });
    }

    _setupAttributes(gl, program) {
        this.#positionLocation = gl.getAttribLocation(program, "position");
        this.#sizeLocation = gl.getAttribLocation(program, "size");
    }
}

export { PointShader }