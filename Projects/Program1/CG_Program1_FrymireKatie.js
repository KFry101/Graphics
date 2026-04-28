"use strict";			// Enforce typing in javascript

var canvas;			    // Drawing surface 
var gl;				    // Graphics context



var rotSpeed = 0.008;
var axis = 1;			// Currently active axis of rotation
var xAxis = 0;			//  index into theta to indicate rotation angle around X
var yAxis = 1;			//  index into theta to indicate rotation angle around Y
var zAxis = 2;          //  index into theta to indicate rotation angle around Z
var flag = false;       // Rotation Toggle control

var theta = [0, 0, 0];	// Rotation angles for x, y and z axes
var translate = [0, 0, 0, 0];

var numElementsP;

var aPositionP;
var aPositionL;
var colorLocP;
var colorLocL;

//pedestal
var pBuffer;
var piBuffer;
var pcBuffer;

var lBuffer;
var lcBuffer;
var liBuffer;



var thetaLoc;			// Holds shader uniform variable location
var slideLoc;   //for the slider 

var stretchLoc;
var stretchOffset = 0.0;


//PEDESTAL STUFF

var yTop = -0.3;
var yBottom = -0.9;
let rb = 0.8;
let rt = 0.4;


var N=8;
var pedestal = new Float32Array((3*N*2)+6);
var colors = new Float32Array(4*N*2);


for(var i=0; i<N; i++){ 

    let xb = rb*Math.cos(i*2*Math.PI/N);
    let zb= rb*Math.sin(i*2*Math.PI/N);

    let xt = rt*Math.cos(i*2*Math.PI/N);
    let zt= rt*Math.sin(i*2*Math.PI/N);

  
    pedestal[3*(2*i)] = xt;
    pedestal[3*(2*i)+1] = yTop;
    pedestal[3*(2*i)+2] = zt;    

    pedestal[3*(2*i+1)] = xb;
    pedestal[3*(2*i+1)+1] = yBottom;
    pedestal[3*(2*i+1)+2] = zb;
}

pedestal[3*16 ]=0.0;
pedestal[3*16 +1]=yBottom;
pedestal[3*16 +2]=0.0;

pedestal[3*17 ]=0.0;
pedestal[3*17 +1]=yTop;
pedestal[3*17 +2]=0.0;

var pedIndices = new Uint16Array([
    0, 2, 1,
    1, 3, 2,
    2, 4, 3,
    3, 5, 4,
    4, 6, 5,
    5, 7, 6,
    6, 8, 7,
    7, 9, 8,
    8, 10, 9,
    9, 11, 10,
    10, 12, 11,
    11, 13, 12,
    12, 14, 13,
    13, 15, 14,
    14, 0, 15,
    15, 1, 0,
    17, 0, 2, //top cap
    17, 2, 4,
    17, 4, 6,
    17, 6, 8,
    17, 8, 10,
    17, 10, 12,
    17, 12, 14,
    17, 14, 0,
    16, 1, 3, //bottom cap
    16, 3, 5,
    16, 5, 7,  
    16, 7, 9,
    16, 9, 11,
    16, 11, 13,
    16, 13, 15,
    16, 15, 1
]);

numElementsP = pedIndices.length;

var pedColors = new Float32Array([
    0.0, 0.0, 1.0, 1.0, 
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0
]);


//LETTER STUFF

var letters = new Float32Array([ //"KF"
    //K
    -0.3, -0.3, 0.1, 
    -0.3, 0.5, 0.1, //top 
    -0.2, -0.3, 0.1, 
    -0.2, 0.5, 0.1, //top 

    -0.3, -0.3, -0.1,
    -0.3, 0.5, -0.1,    //top
    -0.2, -0.3, -0.1,
    -0.2, 0.5, -0.1,//top

    -0.1, -0.3, 0.1,
    -0.2, 0.1, 0.1,
    0.0, -0.3, 0.1,
    -0.1, 0.1, 0.1,
    
    0.0, 0.5 , 0.1, //top
    -0.1, 0.5 , 0.1,//top

    -0.1, -0.3, -0.1,
    -0.2, 0.1, -0.1,
    0.0, -0.3, -0.1,
    -0.1, 0.1, -0.1,
    
    0.0, 0.5, -0.1, //top
    -0.1, 0.5, -0.1,//top

    //F
    0.1, -0.3, 0.1,
    0.1, 0.5, 0.1, //top 21
    0.2, -0.3, 0.1,
    0.2, 0.5, 0.1,  // 23

    0.1, -0.3, -0.1,
    0.1, 0.5, -0.1,//top 25
    0.2, -0.3, -0.1,
    0.2, 0.5, -0.1, // 27

    0.4, 0.5, 0.1,  //28 top
    0.2, 0.4, 0.1,  //29
    0.4, 0.4, 0.1, //30
 
    0.4, 0.5, -0.1,   //31 top 
    0.2, 0.4, -0.1, //32
    0.4, 0.4, -0.1, //33

    //middle horizontal points
    0.2, 0.3, 0.1, //34
    0.4, 0.3, 0.1,
    0.2, 0.3, -0.1,
    0.4, 0.3, -0.1,

    0.2, 0.2, 0.1, //38
    0.4, 0.2, 0.1,
    0.2, 0.2, -0.1,
    0.4, 0.2, -0.1




]);

var letterColors = new Float32Array([   
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    1.0, 0.0, 0.0, 1.0,
    1.0, 0.5, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.5, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    1.0, 0.0, 0.0, 1.0,
    1.0, 0.5, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.5, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    1.0, 1.0, 0.0, 1.0,
    1.0, 0.88, 0.0, 1.0,
    1.0, 0.8, 0.0, 1.0,

    1.0, 1.0, 0.0, 1.0,
    1.0, 0.88, 0.0, 1.0,
    1.0, 0.8, 0.0, 1.0,


    1.0, 0.78, 0.0, 1.0,
    1.0, 0.78, 0.0, 1.0,
    1.0, 0.78, 0.0, 1.0,
    1.0, 0.78, 0.0, 1.0,
    1.0, 0.6, 0.0, 1.0,
    1.0, 0.6, 0.0, 1.0,
    1.0, 0.6, 0.0, 1.0,
    1.0, 0.6, 0.0, 1.0,
    
]);

var letterIndices = new Uint16Array([
    //K
    0, 1, 2,
    1, 2, 3,

    0, 4, 5,
    0, 5, 1,

    2, 6, 7,
    2, 7, 3,

    4, 6, 7,
    4, 7, 5,

    1, 3, 7, //top face
    1, 7, 5,

    8, 9, 10,
    9, 10, 11,
    9, 11, 12,
    9,13, 12,

    14, 15, 16,
    15, 16, 17,
    15, 17, 18,
    15, 19, 18,

    8, 9, 15,
    8, 15, 14,

    10, 11, 17,
    10, 17, 16,

    11, 12, 18,
    11, 18, 17,

    9, 13, 19,
    9, 19, 15,

    12, 13, 19, //top face
    12, 19, 18,

    //F
    20, 21, 22, //vertical front
    21, 22, 23,

    24, 25, 26, //vertical back
    25, 26, 27,

    20, 24, 25, //vertical left
    20, 25, 21,

    22, 26, 27, //vertical right
    22, 27, 23,

    //top  back  horizontal
    23, 28, 29,
    30, 28, 29,

    //top front horizontal
    31, 32, 33,
    27, 31, 32,

    //top face !!!!!!!!!!!!!!!!!!!!!!!!!!!
    21, 25, 31,
    21, 31, 28,

    31, 28, 30,
    30, 33, 31,

    29, 32, 33,
    30, 29, 33,

    //middle hortizontal 
    34, 35, 36,
    35, 36, 37,
    38, 39, 40,
    39, 40, 41,

    34,38,39,
    34,39,35,

    35,39, 41,
    37, 41,35, 

    37, 38, 40,
    37, 40, 36

]);

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
   
    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //pedestal stuff
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pedestal, gl.STATIC_DRAW);

    piBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pedIndices, gl.STATIC_DRAW);

    pcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pedColors, gl.STATIC_DRAW);

    //letter stuff
    lBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, letters, gl.STATIC_DRAW);

    lcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, letterColors, gl.STATIC_DRAW);  
    
    liBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, liBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, letterIndices, gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer 
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    aPositionP = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPositionP, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionP);

    gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
    colorLocP = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLocP, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocP);

    gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
    aPositionL = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPositionL, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionL);

    gl.bindBuffer(gl.ARRAY_BUFFER, lcBuffer);
    colorLocL = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLocL, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocL);

    

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    gl.uniform3fv(thetaLoc, theta);

    slideLoc = gl.getUniformLocation(program, "uTranslate");
    gl.uniform4fv(slideLoc, translate);
    gl.viewport( 0, 0, canvas.width, canvas.height ); // 

    stretchLoc = gl.getUniformLocation(program, "stretchOffset");
    gl.uniform1f(stretchLoc, stretchOffset);
    

    // Render
    gl.clear(gl.COLOR_BUFFER_BIT);     // Clear all pixels in the framebuffer

    document.getElementById("xslider").onpointermove = function(event) {
        translate[0] = +event.target.value;
    };
      document.getElementById("yslider").onpointermove = function(event) {
        translate[1] = +event.target.value;
    };
        document.getElementById("zslider").onpointermove = function(event) {
        translate[2] = +event.target.value;
    };

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

    document.getElementById("StretchInput").oninput = function(event) {
        stretchOffset = +event.target.value;
        gl.uniform1f(stretchLoc, stretchOffset);
    };

    //reset stretch button
    document.getElementById("ButtonS0").onclick = function() {
        stretchOffset = 0.0;
        gl.uniform1f(stretchLoc, stretchOffset);
        document.getElementById("StretchInput").value = 0.0;

    };

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor( 0.4, 0.4, 0.4, 1.0 );    
    render();
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) {
        theta[axis] += rotSpeed;
    }

    gl.uniform3fv(thetaLoc, theta);
    gl.uniform4fv(slideLoc, translate);

    // PEDESTAL
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.vertexAttribPointer(aPositionP, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
    gl.vertexAttribPointer(colorLocP, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piBuffer);
    gl.drawElements(gl.TRIANGLES, numElementsP, gl.UNSIGNED_SHORT, 0);

    // LETTERS
    gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
    gl.vertexAttribPointer(aPositionL, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, lcBuffer);
    gl.vertexAttribPointer(colorLocL, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, liBuffer);
    gl.drawElements(gl.TRIANGLES, letterIndices.length, gl.UNSIGNED_SHORT, 0);

    


    requestAnimationFrame(render);	// Call to browser to refresh display
}