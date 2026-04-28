"use strict";



var meshHills = function() {

var gl;



var nRows = 50;
var nColumns = 50;

var data = [];
for(var i = 0; i < nRows; ++i) {
    data.push([]);
    var x = 4*i/nRows - 2.0;

    for(var j = 0; j < nColumns; ++j) {
        var y = 4*j/nColumns - 2.0;
        
        var hills = Math.sin(x * 1.5) * Math.cos(y * 1.5) * 0.3 +
                    Math.sin(x * 3.2) * Math.cos(y * 2.7) * 0.2 +
                    Math.sin(x * 0.8) * Math.cos(y * 0.9) * 0.15;
        data[i][j] = hills;
    }
}
var positionsArray = [];
var colorLoc;
var near = -10;
var far = 10;
var radius = 1.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const green = vec4(0.1, 0.5, 0.0, 1.0);

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0); 

var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


init();

function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            positionsArray.push( vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0));
            positionsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0));
            positionsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0));
            positionsArray.push( vec4(2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0) );
        }
    }
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc);

    colorLoc = gl.getUniformLocation(program, "uColor");

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    // event listeners for buttons and sliders
 
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near  *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9;};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1;};
    document.getElementById("Button11").onclick = function(){top  *= 0.9; bottom *= 0.9;};
    document.getElementById("Button12").onclick = function(){top *= 1.1; bottom *= 1.1;};

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    var modelViewMatrix = lookAt(eye, at, up);
    
    // Apply rotation matrices from MVnew.js

    
    var projectionMatrix = ortho(left, right, bottom, top, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // draw each quad as two filled blue triangles
    // and then as two black line loops

    for(var i=0; i<positionsArray.length; i+=4) {
        gl.uniform4fv(colorLoc, green);
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(colorLoc, black);
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }


    requestAnimationFrame(render);
}




}

meshHills();