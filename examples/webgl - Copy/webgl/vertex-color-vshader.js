import { VertexShader } from "./vertex-shader.js";

const SHADER_CODE = `
attribute vec4 position;
attribute vec4 color;
varying vec4 v_color;
void main() {
  gl_Position = position;
  v_color = color;
}`;

class VertexColorShader extends VertexShader {
    static create() {
        return new VertexColorShader();
    }

    #positionLocation = null;
    #colorLocation = null;

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


    _setupAttributes(gl, program) {
        this.#positionLocation = gl.getAttribLocation(program, "position");
        this.#colorLocation = gl.getAttribLocation(program, "color");
    }



}

export { VertexColorShader }