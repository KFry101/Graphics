"use strict";

var tetrahedronLight = function() {
//  global variables
var canvas;
var gl;

var shaders = {
    cookTorrance:      null,
    gouraud:    null,
    blinnPhong:       null
}

var currentShaders = null;

var numTimesToSubdivide = 3; //number of times to subdivide the tetrahedron

var index = 0;

var positionsArray = [];
var normalsArray = [];


//used to caluclate and adjust the ey position
var radius = 1.5;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

//used in the projection matrix
var left = -3.0;
var right = 3.0;
var top =3.0;
var bottom = -3.0;
var near = -10;
var far = 10;


// Vertices of a unit tetrahedron
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);


var numLights = 2;

var lightPositions = [
    vec4(2, 2, 1.0, 1.0),   // white key light
    vec4( -4, -3.0, -1.0, 1.0)  // blue fill light
];

var lightAmbients = [
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.1, 0.1, 0.3, 1.0)
];

var lightDiffuses = [
    vec4(2.5, 2.5, 2.5, 1.0),
    vec4(0.6, 0.7, 1.5, 1.0)
];

var lightSpeculars = [
    vec4(3.5, 3.5, 3.5, 1.0),
    vec4(0.5, 0.7, 1.5, 1.0)
];


var materialAmbient  = vec4(0.4, 0.4, 0.4, 1.0);
var materialDiffuse  = vec4(0.25, 0.25, 0.25, 1.0);  
var materialSpecular = vec4(0.9, 0.9, 0.9, 1.0);     // neutral (not tinted)
var materialShininess = 120.0;                       // softer than chrome
var materialF0 = 0.91;                               // aluminum reflectance

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;

var nBuffer, vBuffer;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);





init();

//----------------------------------------------------------------------------
// functions for creating the tetrahedron geometry
//----------------------------------------------------------------------------
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal[0], normal[1], normal[2], 0.0);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);


     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);

     index += 3;
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//----------------------------------------------------------------------------


function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }  

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    shaders.cookTorrance = initShaders( gl, "cook-torrance-vertex-shader", "cook-torrance-fragment-shader" );
    shaders.gouraud = initShaders( gl, "gouraud-vertex-shader", "gouraud-fragment-shader" );
    shaders.blinnPhong= initShaders( gl, "blinn-phong-vertex-shader", "blinn-phong-fragment-shader" );

    currentShaders = getSelectedShader();
    
    gl.useProgram(currentShaders);

    modelViewMatrixLoc  = gl.getUniformLocation(currentShaders, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(currentShaders, "uProjectionMatrix");
    nMatrixLoc          = gl.getUniformLocation(currentShaders, "uNormalMatrix");

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
  

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var aNormal = gl.getAttribLocation(currentShaders, "aNormal");
    gl.vertexAttribPointer(aNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW );

    var aPosition = gl.getAttribLocation(currentShaders, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};
     document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        positionsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        positionsArray = [];
        normalsArray = [];
        init();
    };

    document.getElementById("shading").onchange = function(event) {
        currentShaders = shaders[event.target.value];
        gl.useProgram(currentShaders);
        bindAttributes();
        fetchMatrixLocs();
        setUniforms();
        };

    setUniforms();

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
               radius*Math.sin(theta)*Math.sin(phi), 
               radius*Math.cos(theta));
               
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);

    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
  
    for (var i = 0; i < index; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
    requestAnimationFrame(render);

}
function getSelectedShader() {
    var dropdown = document.getElementById("shading");
    return shaders[dropdown.value];
}

function fetchMatrixLocs() {
    modelViewMatrixLoc  = gl.getUniformLocation(currentShaders, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(currentShaders, "uProjectionMatrix");
    nMatrixLoc          = gl.getUniformLocation(currentShaders, "uNormalMatrix");
}

function bindAttributes() {
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    var aNormal = gl.getAttribLocation(currentShaders, "aNormal");
    gl.vertexAttribPointer(aNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var aPosition = gl.getAttribLocation(currentShaders, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
}

function setUniforms() {
var ambientProduct  = [];
var diffuseProduct  = [];
var specularProduct = [];

for (var i = 0; i < numLights; i++) {
    ambientProduct.push(mult(lightAmbients[i], materialAmbient));
    diffuseProduct.push(mult(lightDiffuses[i], materialDiffuse));
    specularProduct.push(mult(lightSpeculars[i], materialSpecular));
}

    gl.uniform1i(gl.getUniformLocation(currentShaders, "uNumLightsV"), numLights);
    gl.uniform1i(gl.getUniformLocation(currentShaders, "uNumLightsF"), numLights);

    gl.uniform4fv(gl.getUniformLocation(currentShaders, "uLightPosition"), flatten(lightPositions));
    gl.uniform4fv(gl.getUniformLocation(currentShaders, "uAmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(currentShaders, "uDiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(currentShaders, "uSpecularProduct"), flatten(specularProduct));
    gl.uniform1f( gl.getUniformLocation(currentShaders, "uShininess"),       materialShininess);
    gl.uniform1f( gl.getUniformLocation(currentShaders, "uF0"),              materialF0);  
}
}


tetrahedronLight();
