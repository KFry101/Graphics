"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

// //black
// var vertexBlack = [
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ),  
//     vec4( 0.0, 0.0, 0.0, 1.0 ) 
// ];

var BASE_HEIGHT      = 1;
var BASE_WIDTH       = 10.0;
var HEAD_HEIGHT = 1.0;
var HEAD_WIDTH  = 1.0;
var BODY_HEIGHT = 2.5;
var BODY_WIDTH  = 0.1;
var LEG_HEIGHT = 1.5;
var LEG_WIDTH = 0.1;
var UPPER_ARM_HEIGHT = 1.0;
var UPPER_ARM_WIDTH  = 0.1;
var LOWER_ARM_HEIGHT = 0.8;
var LOWER_ARM_WIDTH  = 0.1;


var X_MIN = -4.4;
var X_MAX = 4.4;
var Z_MIN = -5;
var Z_MAX = 5;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base         = 0;
var RShoulderIdx = 1;
var RElbowIdx    = 2;
var FigXIdx      = 3;
var FigZIdx      = 4;



var theta = [ 0, -30, 20, 0, 0];

var angle = 0;

var waving    = false;
var waveAngle = 0.0;

var modelViewMatrixLoc;
var projectionMatrixLoc;

var vBuffer, cBuffer;

init();


//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


//--------------------------------------------------

function limit( value, min, max ) {
    return Math.min( max, Math.max( min, value ) );
}

function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl');
    if (!gl) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


    // Listeners
    document.getElementById("slider1").oninput = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").oninput = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").oninput = function(event) {
         theta[2] =  event.target.value;
    };

    document.getElementById("waveCheckbox").onchange = function(event) {
        waving = event.target.checked;
    };

    document.addEventListener('keydown', event => {
        switch (event.key) {
            case "w":
                theta[FigZIdx] -= 0.5;
                theta[FigZIdx] = limit(theta[FigZIdx], Z_MIN, Z_MAX);
                
                break;
            case "s":
                theta[FigZIdx] += 0.5;
                theta[FigZIdx] = limit(theta[FigZIdx], Z_MIN, Z_MAX);
                break;
            case "a":
                theta[FigXIdx] -= 0.5;
                theta[FigXIdx] = limit(theta[FigXIdx], X_MIN, X_MAX);
                break;
            case "d":
                theta[FigXIdx] += 0.5;
                theta[FigXIdx] = limit(theta[FigXIdx], X_MIN, X_MAX);
                break;
           
        }
    });

    render();
}



function base() {
    var s = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 1 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function head(){ 
    var s = scale(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 4.6 * HEAD_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function body(){
    var s = scale(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 2* LEG_HEIGHT, 0.0 ), s); 
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}     

function legR(){
    var s = scale(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH);
    var instanceMatrix = mult( translate( 0.25, 0.850 * LEG_HEIGHT, 0.0 ), mult( rotate(-20, vec3(0, 0, 1)), s));
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function legL(){
    var s = scale(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH);
    var instanceMatrix = mult( translate( -0.25, 0.850 * LEG_HEIGHT, 0.0 ), mult( rotate(20, vec3(0, 0, 1)), s));
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function upperArmL() {
    var s = scale(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( -0.3, 3.5* UPPER_ARM_HEIGHT, 0.0 ), mult( rotate(30, vec3(0, 0, 1)), s));
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function lowerArmL() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult(translate( -.55, 3.4* LOWER_ARM_HEIGHT, 0.0 ), mult( rotate(5, vec3(0, 0, 1)), s));  
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function upperArmR() {
    var s = scale( UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH );
    var instanceMatrix = mult( translate( 0, 4 * UPPER_ARM_HEIGHT, 0.0 ), mult( rotate( theta[RShoulderIdx], vec3(0, 0, 1) ), mult( translate( 0.0, -UPPER_ARM_HEIGHT / 2.0, 0.0 ), s ) ) );
    var t = mult( modelViewMatrix, instanceMatrix );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function lowerArmR() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var shoulderPivot = mult( translate( 0, 4 * UPPER_ARM_HEIGHT, 0.0 ), rotate( theta[RShoulderIdx], vec3(0, 0, 1) ) );
    var elbowPivot = mult( shoulderPivot, mult( translate( 0.0, -UPPER_ARM_HEIGHT, 0.0 ), rotate( theta[RElbowIdx], vec3(0, 0, 1) ) ) );
    var instanceMatrix = mult( elbowPivot, mult( translate( 0.0, -LOWER_ARM_HEIGHT / 2.0, 0.0 ), s ) );
 
    var t = mult( modelViewMatrix, instanceMatrix );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function man(){
    head();
    body();
    legR();
    legL();
    upperArmL();
    lowerArmL();
    upperArmR();
    lowerArmR();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    projectionMatrix = perspective( 45, canvas.width/canvas.height, 0.1, 100.0 );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    var eye = vec3(0, 1, 20);
    var at = vec3(0, -2.5, 0);
    var up = vec3(0, 1, 0);

    var cameraMatrix = lookAt(eye, at, up);


    if ( waving ) {
        waveAngle += 0.05;
        theta[RShoulderIdx] = -10 * Math.sin( waveAngle ) -70;
        theta[RElbowIdx]    = -35 * Math.sin( waveAngle + 0.8 ) - 70;
        document.getElementById("slider2").value = theta[RShoulderIdx];
        document.getElementById("slider3").value = theta[RElbowIdx];
    }

    var baseModel= mult(translate(0, -6.0, 0), rotate( theta[Base], vec3(0, 1, 0) ));
    modelViewMatrix = mult( cameraMatrix, baseModel );
    base();

    var manModel= mult( rotate( theta[Base], vec3(0, 1, 0) ), translate( theta[FigXIdx], -5.1, theta[FigZIdx] ) );
    modelViewMatrix = mult( cameraMatrix, manModel );
    man();

    
    
    

    requestAnimationFrame(render);
}
