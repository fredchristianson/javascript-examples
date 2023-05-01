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

    setPoints3f(pointArray) {
        this.withGl(gl => {
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, pointArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(
                this.#positionLocation, // target
                3,        // chunk size (send the values 3 by 3)
                gl.FLOAT, // type
                false,    // normalize
                0,        // stride
                0         // offset
            );
            gl.enableVertexAttribArray(this.#positionLocation);
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