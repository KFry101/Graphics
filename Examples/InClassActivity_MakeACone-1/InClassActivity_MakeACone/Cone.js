"use strict";			// Enforce typing in javascript

var canvas;			    // Drawing surface 
var gl;				    // Graphics context

var theta = [0, 0, 0];	// Rotation angles for x, y and z axes

var rotSpeed = 0.008;
var axis = 1;			// Currently active axis of rotation
var xAxis = 0;			//  index into theta to indicate rotation angle around X
var yAxis = 1;			//  index into theta to indicate rotation angle around Y
var zAxis = 2;          //  index into theta to indicate rotation angle around Z
var flag = false;       // Rotation Toggle control

var thetaLoc;			// Holds shader uniform variable location
var cBuffer;
var vBuffer;
var colorLoc;

//    // DEFINE CONE VERTICES- MODIFY THE CODE HERE
//     var points = new Float32Array ( [
//         -0.5,  0.0,  0.0,  //V0
//          0.5,  0.0,  0.0,  //V1
//          0.0,  0.5,  0.0   //V3
//     ]);

    // DEFINE CONE COLOR ATTRIBUTES - MODIFY THE CODE HERE
    var colors = new Float32Array ( [
        0.0,0.0,1.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED 
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,  //RED
        1.0,0.0,0.0,1.0,   //RED
        1.0,0.0,0.0,1.0   //RED

    ]);

//circle
var N=10;  
var points = new Float32Array(3*N + 3*2);  //3 for the center of the circle and 3 for each point on the circle
let r = 0.3;
points[0] = 0.0;
points[1] = 0.5;
points[2] = 0.0;
for(let i=1; i<=N; i++){;
    points[3*i] = r * Math.cos(2.0 * Math.PI * i / N);
    points[3*i+1] = -0.5;
    points[3*i+2] = r * Math.sin(2.0 * Math.PI * i / N);
}

//close the cone base
points[3*(N+1)] = points[3];
points[3*(N+1)+1] = points[4];
points[3*(N+1)+2] = points[5];



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
   
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load points into vertex array attribute buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    // Load colors into color array atrribute buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("Button0").onclick = function(){
        theta[xAxis] = 0;
        theta[yAxis] = 0;
        theta[zAxis] = 0;
        axis = yAxis;
    };

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor( 1.0, 1.0, 0.0, 1.0);

    render();
}

function render()
{
    gl.clearColor( 0.5, 0.5, 0.5, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Controls
    if(flag) {
        theta[axis] += rotSpeed;
        gl.uniform3fv(thetaLoc, theta);
    }

    // DRAW CONE - MODIFY THE CODE HERE
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length/3);
    gl.drawArrays(gl.TRIANGLE_FAN, 1, points.length/3-1);


    gl.drawArrays(gl.LINE_LOOP, 1, points.length/3-1);


    requestAnimationFrame(render);	// Call to browser to refresh display
}