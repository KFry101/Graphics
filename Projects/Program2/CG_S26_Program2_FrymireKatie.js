"use strict";

var Program2 = function() {
//  global variables
var canvas, gl, programT, programM; 

var terrainPositions = [];
var terrainNormals = [];

var manPositions = [];
var manNormals = [];

var terrainVBuffer, terrainNBuffer;
var manVBuffer, manNBuffer;

var radius = 1.5;
var theta = 0.3;
var phi = 1.25;
var dr = 5.0 * Math.PI/180.0;

// for movement control
var keysHeld = {};

var modelViewMatrixLocM, projectionMatrixLocM, nMatrixLocM;
var aPositionLocM, aNormalLocM;
var modelViewMatrixLocT, projectionMatrixLocT, nMatrixLocT;
var aPositionLocT, aNormalLocT;

var modelViewMatrix;
var projectionMatrix;
var nMatrix;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// adjusted for HW 4 for the new terrain perspective
var HEAD_HEIGHT = 0.03;
var HEAD_WIDTH  = 0.03;
var BODY_HEIGHT = 0.1;
var BODY_WIDTH  = 0.008;
var LEG_HEIGHT = 0.08;
var LEG_WIDTH = 0.005;
var UPPER_ARM_HEIGHT = 0.05;
var UPPER_ARM_WIDTH  = 0.005;
var LOWER_ARM_HEIGHT = 0.04;
var LOWER_ARM_WIDTH  = 0.005;

var RShoulderIdx = 0;
var RElbowIdx    = 1;
var FigXIdx      = 2;
var FigYIdx      = 3;
var FigZIdx      = 4;

var manTheta = [ -30, 23, 25, 0, 25];
var waving = false;
var waveAngle = 0.0;

//-----------------------------------------------------------------------------
var numLights = 2;
var lightPositions = [
    vec4(1, 0.5, 1, 1.0), 
    vec4 (-0.75, 0.5, 0.5, 1.0) 
];
var lightAmbients = [
    vec4(0.6, 0.6, 0.5, 1.0),
    vec4(0.34, 0.25, 0.3, 1.0)
];
var lightDiffuses = [
    vec4(0.45, 0.4, 0.15, 1.0),
    vec4(0.05, 0.2, 0.2, 1.0)
];
var lightSpeculars = [
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.2, 0.2, 0.2, 1.0)
];

//GRASS HILLS
var terrainAmbient  = vec4(0.25, 0.3, 0.10, 1.0);
var terrainDiffuse  = vec4(0.45, 0.42, 0.1, 1.0);
var terrainSpecular = vec4(0.0, 0.0, 0.0, 1.0);
var terrainShininess = 1.0;

//THE MAN
var manAmbient  = vec4(0.15, 0.05, 0.15, 1.0);
var manDiffuse  = vec4(0.7, 0.0, 0.7, 1.0);
var manSpecular = vec4(0.6, 0.4, 0.6, 1.0);
var manShininess = 32.0;

//-----------------------------------------------------------------------------
// terrain

var nRows = 50;
var nColumns = 50;
var data = [];
var terrainHeightScale = 0.5; 

function buildTerrain() {
        for (var i = 0; i < nRows; ++i) {
            data.push([]);
            var x = 4 * i / nRows - 6.0;
            for (var j = 0; j < nColumns; ++j) {
                var y = 4 * j / nColumns - .0;
                var hills = Math.sin(x * 1.5) * Math.cos(y * 1) * 0.3 +
                            Math.sin(x * 1) * Math.cos(y * 0.5) * 0.2 +
                            Math.sin(x * 0.8) * Math.cos(y * 0.9) * 0.15;
                data[i][j] = hills * terrainHeightScale;
            }
        }

        terrainPositions.length = 0;
        terrainNormals.length = 0;

        for (var i = 0; i < nRows - 1; ++i) {
            for (var j = 0; j < nColumns - 1; ++j) {
                var p0 = vec4(2 * i / nRows - 1, data[i][j], 2 * j / nColumns - 1, 1.0);
                var p1 = vec4(2 * (i + 1) / nRows - 1, data[i + 1][j], 2 * j / nColumns - 1, 1.0);
                var p2 = vec4(2 * (i + 1) / nRows - 1, data[i + 1][j + 1], 2 * (j + 1) / nColumns - 1, 1.0);
                var p3 = vec4(2 * i / nRows - 1, data[i][j + 1], 2 * (j + 1) / nColumns - 1, 1.0);

                terrainPositions.push(p0, p1, p2, p3);

                var normal = normalize(cross(subtract(p2, p0), subtract(p1, p0)));
                var n4 = vec4(normal[0], normal[1], normal[2], 0.0);
                terrainNormals.push(n4, n4, n4, n4);
            }
        }
}

//-----------------------------------------------------------------------------
manPositions.length = 0;
manNormals.length = 0;

var verticesCube = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

function quad(a, b, c, d) {
    var p0 = verticesCube[a];
    var p1 = verticesCube[b];
    var p2 = verticesCube[c];
    var p3 = verticesCube[d];

    var n = normalize(cross(subtract(p1, p0), subtract(p2, p0))); //winding 
    var n4 = vec4(n[0], n[1], n[2], 0.0);
    manPositions.push(p0, p1, p2, p0, p2, p3);
    manNormals.push(n4, n4, n4, n4, n4, n4);
}
function cube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

init();

//-----------------------------------------------------------------------------

function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
     gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    buildTerrain();
    cube();

    programT = initShaders( gl, "vertex-shader", "fragment-shader-hills" );
    programM = initShaders( gl, "vertex-shader", "fragment-shader-man" );

    terrainVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(terrainPositions), gl.STATIC_DRAW);

    terrainNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(terrainNormals), gl.STATIC_DRAW);
    
    manVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, manVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(manPositions), gl.STATIC_DRAW);

    manNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, manNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(manNormals), gl.STATIC_DRAW);

    gl.useProgram(programT);
    aPositionLocT = gl.getAttribLocation(programT, "aPosition");
    gl.enableVertexAttribArray(aPositionLocT);
    aNormalLocT = gl.getAttribLocation(programT, "aNormal");
    gl.enableVertexAttribArray(aNormalLocT);

    gl.useProgram(programM);
    aPositionLocM = gl.getAttribLocation(programM, "aPosition");
    gl.enableVertexAttribArray(aPositionLocM);
    aNormalLocM = gl.getAttribLocation(programM, "aNormal");
    gl.enableVertexAttribArray(aNormalLocM);

    gl.useProgram(programT);
    modelViewMatrixLocT = gl.getUniformLocation(programT, "uModelViewMatrix");
    projectionMatrixLocT = gl.getUniformLocation(programT, "uProjectionMatrix");
    nMatrixLocT = gl.getUniformLocation(programT, "uNMatrix");

    gl.useProgram(programM);
    modelViewMatrixLocM = gl.getUniformLocation(programM, "uModelViewMatrix");
    projectionMatrixLocM = gl.getUniformLocation(programM, "uProjectionMatrix");
    nMatrixLocM = gl.getUniformLocation(programM, "uNMatrix");

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

     document.getElementById("slider2").oninput = function(event) {
         manTheta[RShoulderIdx] = event.target.value;
    };
    document.getElementById("slider3").oninput = function(event) {
         manTheta[RElbowIdx] =  event.target.value;
    };
    document.getElementById("waveCheckbox").onchange = function(event) {
        waving = event.target.checked;
    };
    

    document.addEventListener('keydown', function(e) { keysHeld[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup',   function(e) { keysHeld[e.key.toLowerCase()] = false; });

    setUniforms();

    render();
}


function setUniforms() {
var terrainAmbientProduct  = [];
var terrainDiffuseProduct  = [];
var terrainSpecularProduct = [];
var manAmbientProduct  = [];
var manDiffuseProduct  = [];
var manSpecularProduct = [];

for (var i = 0; i < numLights; i++) {
    terrainAmbientProduct.push(mult(lightAmbients[i], terrainAmbient));
    terrainDiffuseProduct.push(mult(lightDiffuses[i], terrainDiffuse));
    terrainSpecularProduct.push(mult(lightSpeculars[i], terrainSpecular));
    manAmbientProduct.push(mult(lightAmbients[i], manAmbient));
    manDiffuseProduct.push(mult(lightDiffuses[i], manDiffuse));
    manSpecularProduct.push(mult(lightSpeculars[i], manSpecular));
}

    gl.useProgram(programT);
    gl.uniform1i(gl.getUniformLocation(programT, "uNumLightsV"), numLights);
    gl.uniform1i(gl.getUniformLocation(programT, "uNumLightsF"), numLights);

    //gl.uniform4fv(gl.getUniformLocation(programT, "uLightPosition"), flatten(lightPositions));

    gl.uniform4fv(gl.getUniformLocation(programT, "uAmbientProduct"), flatten(terrainAmbientProduct));
    gl.uniform4fv(gl.getUniformLocation(programT, "uDiffuseProduct"), flatten(terrainDiffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(programT, "uSpecularProduct"), flatten(terrainSpecularProduct));
    gl.uniform1f( gl.getUniformLocation(programT, "uShininess"), terrainShininess);


    gl.useProgram(programM);
    gl.uniform1i(gl.getUniformLocation(programM, "uNumLightsV"), numLights);
    gl.uniform1i(gl.getUniformLocation(programM, "uNumLightsF"), numLights);

    //gl.uniform4fv(gl.getUniformLocation(programM, "uLightPosition"), flatten(lightPositions));

    gl.uniform4fv(gl.getUniformLocation(programM, "uAmbientProduct"), flatten(manAmbientProduct));
    gl.uniform4fv(gl.getUniformLocation(programM, "uDiffuseProduct"), flatten(manDiffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(programM, "uSpecularProduct"), flatten(manSpecularProduct));
    gl.uniform1f( gl.getUniformLocation(programM, "uShininess"), manShininess);

}

function drawTerrain() {
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBuffer);
    gl.vertexAttribPointer(aPositionLocT, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNBuffer);
    gl.vertexAttribPointer(aNormalLocT, 4, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(aPositionLocT);
    gl.enableVertexAttribArray(aNormalLocT);

    for(var i = 0; i < terrainPositions.length; i += 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
       
    }
}
function drawCube() {
    gl.useProgram(programM);
    gl.bindBuffer(gl.ARRAY_BUFFER, manNBuffer);
    gl.vertexAttribPointer(aNormalLocM, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalLocM);

    gl.bindBuffer(gl.ARRAY_BUFFER, manVBuffer);
    gl.vertexAttribPointer(aPositionLocM, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLocM);

    gl.drawArrays(gl.TRIANGLES, 0, manPositions.length);
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Movement control to get rid of the delay when key is held down, and to allow for multiple keys to be held at oncedww
    if (keysHeld['w']) manTheta[FigZIdx] = Math.max(manTheta[FigZIdx] - 1, 0);
    if (keysHeld['s']) manTheta[FigZIdx] = Math.min(manTheta[FigZIdx] + 1, nColumns - 2);
    if (keysHeld['a']) manTheta[FigXIdx] = Math.max(manTheta[FigXIdx] - 1, 0);
    if (keysHeld['d']) manTheta[FigXIdx] = Math.min(manTheta[FigXIdx] + 1, nRows - 2);

    if ( waving ) {
        waveAngle += 0.05;
        manTheta[RShoulderIdx] = -10 * Math.sin( waveAngle ) -70;
        manTheta[RElbowIdx]    = -35 * Math.sin( waveAngle + 0.8 ) - 70;
        document.getElementById("slider2").value = manTheta[RShoulderIdx];
        document.getElementById("slider3").value = manTheta[RElbowIdx];
    }

    //the math conversion from the number with  data/manTheta into world origin stuff
    var manX = 2.0 * manTheta[FigXIdx]/nRows - 1; 
    var manZ = 2.0 * manTheta[FigZIdx]/nColumns - 1;

    manTheta[FigYIdx]= data[manTheta[FigXIdx]][manTheta[FigZIdx]] + BODY_HEIGHT * 1.25; 

    // move camera with the man
    at = vec3(manX, manTheta[FigYIdx], manZ);
    eye = vec3( manX + radius * Math.cos(theta) * Math.cos(phi),
                manTheta[FigYIdx] + radius * Math.sin(theta),
                manZ + radius * Math.cos(theta) * Math.sin(phi));

    modelViewMatrix = lookAt(eye, at, up);  

    // 
    var eyeSpaceLights = [];
    for (var i = 0; i < numLights; i++) {
        eyeSpaceLights.push(mult(modelViewMatrix, lightPositions[i]));
    }
    gl.useProgram(programT);
    gl.uniform4fv(gl.getUniformLocation(programT, "uLightPosition"), flatten(eyeSpaceLights));
    gl.useProgram(programM);
    gl.uniform4fv(gl.getUniformLocation(programM, "uLightPosition"), flatten(eyeSpaceLights));


    projectionMatrix = perspective(45, canvas.width/canvas.height, 0.1, 100);
    nMatrix = normalMatrix(modelViewMatrix, true);

    
    gl.useProgram(programT);
    gl.uniformMatrix4fv(modelViewMatrixLocT, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLocT, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLocT, false, flatten(nMatrix));
    drawTerrain();

    //this moves the man to standing ont0p of the hills
    modelViewMatrix = mult(modelViewMatrix, translate(manX, manTheta[FigYIdx], manZ));
    gl.useProgram(programM);
    gl.uniformMatrix4fv(modelViewMatrixLocM, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLocM, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(nMatrix));
    drawMan();
    
    requestAnimationFrame(render);
}



function head(){ 
    var s = scale(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH);
    var instanceMatrix = mult( translate( 0.0,  0.6 * BODY_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}

function body(){
    var s = scale(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var instanceMatrix = mult( translate( 0.0,  0.0, 0.0 ), s); 
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}     

function legR(){
    var s = scale(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH);
    var instanceMatrix = mult( translate( BODY_WIDTH * 0.8, -0.85* BODY_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}
function legL(){
    var s = scale(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH);
    var instanceMatrix = mult( translate( -BODY_WIDTH * 0.8, -0.85 * BODY_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}

function upperArmL() {
    var s = scale(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( -BODY_WIDTH * 2, BODY_HEIGHT * 0.2, 0.0 ), mult( rotate(30, vec3(0, 0, 1)), s));
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}
function upperArmR() {
    var s = scale( UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH );
    var instanceMatrix = mult( translate( BODY_WIDTH*0.1 , BODY_HEIGHT * 0.41, 0.0 ), mult( rotate(manTheta[RShoulderIdx], vec3(0, 0, 1) ), mult( translate( 0.0, -UPPER_ARM_HEIGHT / 2.0, 0.0 ), s ) ) );
    var t = mult( modelViewMatrix, instanceMatrix );
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    drawCube();
}

function lowerArmL() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult(translate( -BODY_WIDTH * 3.7, BODY_HEIGHT * 0.2 - UPPER_ARM_HEIGHT * 0.8, 0.0 ), mult( rotate(5, vec3(0, 0, 1)), s));  
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLocM,  false, flatten(t)  );
    drawCube();
}
function lowerArmR() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);

    var shoulderPivot = mult( translate( 0.0, UPPER_ARM_HEIGHT * 0.85, 0.0 ), rotate( manTheta[RShoulderIdx], vec3(0, 0, 1) ) );
    var elbowPivot = mult( shoulderPivot, mult( translate( 0.0, -UPPER_ARM_HEIGHT, 0.0 ), rotate( manTheta[RElbowIdx], vec3(0, 0, 1) ) ) );
    var instanceMatrix = mult( elbowPivot, mult( translate( 0.0, -LOWER_ARM_HEIGHT / 2.0, 0.0 ), s ) );
    var t = mult( modelViewMatrix, instanceMatrix );
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    drawCube();
}

function drawMan() {
    head();
    body();
    upperArmL();
    lowerArmL();
    upperArmR();
    lowerArmR();
    legR();
    legL();
}

}

Program2();




