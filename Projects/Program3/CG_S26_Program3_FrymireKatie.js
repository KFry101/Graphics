
"use strict";


var Program3 = function() {
//  global variables
var canvas, gl, programT, programM, programS; 

// at the top with your other globals
var terrainVAO, manVAO, skyVAO;

var terrainPositions = [];
var terrainNormals = [];
var terrainTexCoords = [];
var terrainVBuffer, terrainNBuffer, terrainTBuffer;
var textureG;
var imgG;


var manPositions = [];
var manNormals = [];
var manVBuffer, manNBuffer;


var skyPositions = new Float32Array([
    -1, -1,  -1,
    -1,  1,  -1,
     1, -1,  -1,
    -1,  1,  -1,
     1,  1,  -1,
     1, -1,  -1,

    -1, -1,   1,
     1, -1,   1,
    -1,  1,   1,
    -1,  1,   1,
     1, -1,   1,
     1,  1,   1,

    -1,   1, -1,
    -1,   1,  1,
     1,   1, -1,
    -1,   1,  1,
     1,   1,  1,
     1,   1, -1,

    -1,  -1, -1,
     1,  -1, -1,
    -1,  -1,  1,
    -1,  -1,  1,
     1,  -1, -1,
     1,  -1,  1,

    -1,  -1, -1,
    -1,  -1,  1,
    -1,   1, -1,
    -1,  -1,  1,
    -1,   1,  1,
    -1,   1, -1,

     1,  -1, -1,
     1,   1, -1,
     1,  -1,  1,
     1,  -1,  1,
     1,   1, -1,
     1,   1,  1,
]);
var skyVBuffer;
var textureDay, textureNight;
var isNight;

var radius = 2;
var theta = 0.2;
var phi = 1.05;
var dr = 5.0 * Math.PI/180.0;
var manFacing= phi - .25

// for movement control
var moveCounter = 0;
var keysHeld = {};

var modelViewMatrixLocT, projectionMatrixLocT, nMatrixLocT;
var aPositionLocT, aNormalLocT, aTexCoordLocT;

var modelViewMatrixLocM, projectionMatrixLocM, nMatrixLocM;
var aPositionLocM, aNormalLocM;

var modelViewMatrixLocS, projectionMatrixLocS, nMatrixLocS;
var aPositionLocS, aNormalLocS, aTexCoordLocS;

var modelViewMatrix;
var projectionMatrix;
var nMatrix;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// adjusted for HW 4 for the new terrain perspective
var HEAD_HEIGHT = 0.06;
var HEAD_WIDTH  = 0.06;
var BODY_HEIGHT = 0.20;
var BODY_WIDTH  = 0.016;
var UPPER_LEG_HEIGHT = 0.12;
var UPPER_LEG_WIDTH  = 0.012;
var LOWER_LEG_HEIGHT = 0.10;
var LOWER_LEG_WIDTH  = 0.010;
var UPPER_ARM_HEIGHT = 0.10;
var UPPER_ARM_WIDTH  = 0.010;
var LOWER_ARM_HEIGHT = 0.08;
var LOWER_ARM_WIDTH  = 0.010;

var RShoulderIdx = 0;
var RElbowIdx    = 1;
var FigXIdx      = 2;
var FigYIdx      = 3;
var FigZIdx      = 4;
var LShoulderIdx = 5;
var LElbowIdx    = 6;
var RHipIdx      = 7;
var RKneeIdx     = 8;
var LHipIdx      = 9;
var LKneeIdx     = 10;
var RShoulderIdz = 11;
var RElbowIdz    = 12;
var LShoulderIdz = 13;
var LElbowIdz    = 14;

var manTheta = [ -30, 23, 25, 0, 25, 30, -23, 0,  0,  0,  0,  0,  0,  0, 0 ];
//               RSx  REx Fx  Fy Fz  LSx LEx RHz RKz LHz LKz RSz REz LSz LEz
var waving = false;
var waveAngle = 0.0;

var walking   = false;
var walkAngle = 0.0;
//-----------------------------------------------------------------------------
var numLights = 1;
var lightPositions = [
    vec4( 0,   3,  0,   1.0),   // white
    vec4( 1,   1,  1,   1.0),   // blue
    vec4(-1,   1,  1,   1.0),   // red
    vec4(-1,   1, -1,   1.0),   // green
    vec4( 1,   1, -1,   1.0)    // yellow
];

var dayLightAmbients = [
    vec4(0.45, 0.35, 0.32, 1.0),   
    vec4(0.00, 0.00, 0.04, 1.0),
    vec4(0.04, 0.00, 0.00, 1.0),
    vec4(0.00, 0.04, 0.00, 1.0),
    vec4(0.04, 0.04, 0.00, 1.0)
];
var dayLightDiffuses = [
    vec4(0.9, 0.9, 0.8, 1.0),   
    vec4(0.0, 0.0,  0.9, 1.0),
    vec4(0.9, 0.0,  0.0, 1.0),
    vec4(0.0, 0.9,  0.0, 1.0),
    vec4(0.9, 0.9,  0.0, 1.0)
];
var dayLightSpeculars = [
    vec4(0.9, 0.85, 0.7, 1.0),   
    vec4(0.0, 0.0, 0.6, 1.0),
    vec4(0.6, 0.0, 0.0, 1.0),
    vec4(0.0, 0.6, 0.0, 1.0),
    vec4(0.6, 0.6, 0.0, 1.0)
];

var nightLightAmbients = [
    vec4(0.22, 0.22, 0.25, 1.0),   
    vec4(0.00, 0.00, 0.02, 1.0),
    vec4(0.02, 0.00, 0.00, 1.0),
    vec4(0.00, 0.02, 0.00, 1.0),
    vec4(0.02, 0.02, 0.00, 1.0)
];
var nightLightDiffuses = [
    vec4(0.35, 0.35, 0.5, 1.0),   
    vec4(0.0,  0.0,  0.4, 1.0),
    vec4(0.4,  0.0,  0.0, 1.0),
    vec4(0.0,  0.4,  0.0, 1.0),
    vec4(0.4,  0.4,  0.0, 1.0)
];
var nightLightSpeculars = [
    vec4(0.3, 0.3, 0.5, 1.0),   
    vec4(0.0, 0.0, 0.3, 1.0),
    vec4(0.3, 0.0, 0.0, 1.0),
    vec4(0.0, 0.3, 0.0, 1.0),
    vec4(0.3, 0.3, 0.0, 1.0)
];


var lightAmbients;
var lightDiffuses;
var lightSpeculars;

function applyLightMode() {
    if (isNight) {
        lightAmbients  = nightLightAmbients;
        lightDiffuses  = nightLightDiffuses;
        lightSpeculars = nightLightSpeculars;
    } else {
        lightAmbients  = dayLightAmbients;
        lightDiffuses  = dayLightDiffuses;
        lightSpeculars = dayLightSpeculars;
    }
    setUniforms();   
}
//GRASS HILLS
var terrainAmbient  = vec4(0.03, 0.05, 0.03, 1.0);  
var terrainDiffuse  = vec4(0.25, 0.55, 0.2,  1.0);  
var terrainSpecular = vec4(0.05, 0.1,  0.05, 1.0);  // very subtle sheen
var terrainShininess = 4.0;                         

//THE MAN
var manAmbient  = vec4(0.05, 0.05, 0.05, 1.0);  // very dark base — no self-glow
var manDiffuse  = vec4(0.7,  0.7,  0.7,  1.0);  // bright grey — strong diffuse response
var manSpecular = vec4(0.4,  0.4,  0.4,  1.0);  // moderate specular highlight
var manShininess = 32.0;

//-----------------------------------------------------------------------------
// terrain

var nRows = 50;
var nColumns = 50;
var data = [];
var terrainHeightScale = 0.8; 

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
        terrainTexCoords.length = 0;

        for (var i = 0; i < nRows - 1; ++i) {
            for (var j = 0; j < nColumns - 1; ++j) {
                var p0 = vec4(8 * i / nRows - 4, data[i][j], 8 * j / nColumns - 4, 1.0);
                var p1 = vec4(8 * (i + 1) / nRows - 4, data[i + 1][j], 8 * j / nColumns - 4, 1.0);
                var p2 = vec4(8 * (i + 1) / nRows - 4, data[i + 1][j + 1], 8 * (j + 1) / nColumns - 4, 1.0);
                var p3 = vec4(8 * i / nRows - 4, data[i][j + 1], 8 * (j + 1) / nColumns - 4, 1.0);

                terrainPositions.push(p0, p1, p2, p3);

                var normal = normalize(cross(subtract(p2, p0), subtract(p1, p0)));
                var n4 = vec4(normal[0], normal[1], normal[2], 0.0);
                terrainNormals.push(n4, n4, n4, n4);

                //Grass UV coordinates 
                var k = 5;
                var uv0 = vec2(k * i/nRows,       k * j/nColumns);
                var uv1 = vec2(k * (i+1)/nRows,   k * j/nColumns);
                var uv2 = vec2(k * (i+1)/nRows,   k * (j+1)/nColumns);
                var uv3 = vec2(k * i/nRows,       k * (j+1)/nColumns);
                terrainTexCoords.push(uv0, uv1, uv2, uv3);

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

//---------------------------------------------------------------------------------
function buildCubeMap(faceInfos, texture, textureUnit) {
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // Set parameters immediately (these are fine before load)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    let loadedCount = 0;

    faceInfos.forEach(({ target, url }) => {
        // Fill with placeholder
        gl.activeTexture(textureUnit);
        gl.texImage2D(target, level, internalFormat,
            1, 1, 0, format, type,
            new Uint8Array([0, 0, 255, 255])
        );

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = url;
       
        image.onload = function () {
            gl.activeTexture(textureUnit);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            loadedCount++;

            // Only generate mipmaps once ALL 6 faces are loaded
            if (loadedCount === faceInfos.length) {
                gl.activeTexture(textureUnit);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }
        };
         image.onerror = function() {
            console.error("Failed to load cubemap face:", url.substring(0, 400));
        };
    });
}
//-----------------------------------------------------------------------------

init();

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
    programS = initShaders( gl, "vertex-shader-sky", "fragment-shader-sky")

    gl.useProgram(programT);
    aPositionLocT = gl.getAttribLocation(programT, "aPosition");
    aNormalLocT   = gl.getAttribLocation(programT, "aNormal");
    aTexCoordLocT = gl.getAttribLocation(programT, "aTexCoord");
    modelViewMatrixLocT  = gl.getUniformLocation(programT, "uModelViewMatrix");
    projectionMatrixLocT = gl.getUniformLocation(programT, "uProjectionMatrix");
    nMatrixLocT          = gl.getUniformLocation(programT, "uNMatrix");

    gl.useProgram(programM);
    aPositionLocM = gl.getAttribLocation(programM, "aPosition");
    aNormalLocM   = gl.getAttribLocation(programM, "aNormal");
    modelViewMatrixLocM  = gl.getUniformLocation(programM, "uModelViewMatrix");
    projectionMatrixLocM = gl.getUniformLocation(programM, "uProjectionMatrix");
    nMatrixLocM          = gl.getUniformLocation(programM, "uNMatrix");

    gl.useProgram(programS);
    aPositionLocS = gl.getAttribLocation(programS, "aPosition");

    //------------------------------------------------------------------------
    //Terrain
    //------------------------------------------------------------------------
    terrainVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(terrainPositions), gl.STATIC_DRAW);

    terrainNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(terrainNormals), gl.STATIC_DRAW);

    terrainTBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainTBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(terrainTexCoords), gl.STATIC_DRAW);

    terrainVAO = gl.createVertexArray();
    gl.bindVertexArray(terrainVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBuffer);
    gl.vertexAttribPointer(aPositionLocT, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLocT);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNBuffer);
    gl.vertexAttribPointer(aNormalLocT, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalLocT);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainTBuffer);
    gl.vertexAttribPointer(aTexCoordLocT, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoordLocT);

    gl.bindVertexArray(null);

    textureG = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureG);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([100, 255, 0, 255]));
    imgG = new Image();
    imgG.crossOrigin = "anonymous";
    // imgG.src = "https://i.imgur.com/SohhFGz.png";
    imgG.src = "https://raw.githubusercontent.com/KFry101/Graphics/main/Projects/Program3/assets/grass.png";
    
    imgG.addEventListener('load', function(){
        gl.bindTexture(gl.TEXTURE_2D, textureG );
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgG);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    //------------------------------------------------------------------------
    //SKYBOX 
    //------------------------------------------------------------------------
    skyVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyPositions, gl.STATIC_DRAW);

    skyVAO = gl.createVertexArray();
    gl.bindVertexArray(skyVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyVBuffer);
    gl.vertexAttribPointer(aPositionLocS, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLocS);
    gl.bindVertexArray(null);

    textureNight = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureNight);
    textureDay = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureDay);

    const faceInfosDay = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: "https://i.imgur.com/CDOy9JA.jpeg",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: "https://i.imgur.com/Nol1uUe.jpeg",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: "https://i.imgur.com/27mvm3G.jpeg",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: "https://i.imgur.com/sD7wmTx.jpeg",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: "https://i.imgur.com/zmb9uS7.jpeg",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: "https://i.imgur.com/eAtRu4C.jpeg",
        },
    ];
    
    const faceInfosNight = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: 'https://i.imgur.com/uBgZQLU.jpeg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: 'https://i.imgur.com/mp3HHQt.jpeg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: 'https://i.imgur.com/Vrr31ey.jpeg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: 'https://i.imgur.com/ACsG2uh.jpeg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: 'https://i.imgur.com/5LOnxEb.jpeg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: 'https://i.imgur.com/ffNUzLS.jpeg',
        },
    ];

    buildCubeMap(faceInfosDay, textureDay, gl.TEXTURE2);
    buildCubeMap(faceInfosNight,textureNight, gl.TEXTURE1);
    
    //------------------------------------------------------------------------
    //Man
    //------------------------------------------------------------------------
    manVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, manVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(manPositions), gl.STATIC_DRAW);

    manNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, manNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(manNormals), gl.STATIC_DRAW);

    manVAO = gl.createVertexArray();
    gl.bindVertexArray(manVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, manVBuffer);
    gl.vertexAttribPointer(aPositionLocM, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLocM);

    gl.bindBuffer(gl.ARRAY_BUFFER, manNBuffer);
    gl.vertexAttribPointer(aNormalLocM, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalLocM);

    gl.bindVertexArray(null);

    //------------------------------------------------------------------------
    // event listeners

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};

    document.getElementById("skySwitch").onclick = function(event){
        isNight = event.target.checked;
        applyLightMode();
    }

    document.getElementById("slider2").oninput = function(event) {
         manTheta[RShoulderIdx] = event.target.value;
    };
    document.getElementById("slider3").oninput = function(event) {
         manTheta[RElbowIdx] =  event.target.value;
    };
    document.getElementById("waveSwitch").onchange = function(event) {
        waving = event.target.checked;
    };
    

    document.addEventListener('keydown', function(e) { keysHeld[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup',   function(e) { keysHeld[e.key.toLowerCase()] = false; });

    applyLightMode();

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
    gl.bindVertexArray(terrainVAO);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureG);
    gl.uniform1i(gl.getUniformLocation(programT, "uTexture"), 0);

    for (var i = 0; i < terrainPositions.length; i += 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }
    gl.bindVertexArray(null);

}

function drawCube() {
    gl.useProgram(programM);
    gl.bindVertexArray(manVAO);
    gl.drawArrays(gl.TRIANGLES, 0, manPositions.length);
    gl.bindVertexArray(null);
}

function drawSkybox(K) {

    var skyView = mat4(
        modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2], 0,
        modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2], 0,
        modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2], 0,
        0, 0, 0, 1
    );
    gl.uniformMatrix4fv(gl.getUniformLocation(programS, "uViewProj"),
        false, flatten(mult(projectionMatrix, skyView)));
    gl.uniform1i(gl.getUniformLocation(programS, "uSkybox"), K);

    gl.bindVertexArray(skyVAO);
    gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.depthMask(true);
    gl.bindVertexArray(null);
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(keysHeld['arrowup']) theta += dr*0.3;
    if(keysHeld['arrowdown']) theta -= dr*0.3;
    if(keysHeld['arrowleft']) phi -= dr*0.3;
    if(keysHeld['arrowright']) phi +=dr*0.3;
    
    if (keysHeld['w'] || keysHeld['s'] || keysHeld['a'] || keysHeld['d']) {
        walking=true;
        manFacing= phi - .25
    } 
    else { walking = false;}

    moveCounter++;
    if (moveCounter >= 2) {
        moveCounter = 0;

        var cos = Math.cos(manFacing);
        var sin = Math.sin(manFacing);

        var dx = 0, dz = 0;
       if (keysHeld['w']) { dx -= cos; dz -= sin;  }
        if (keysHeld['s']) { dx += cos; dz += sin; }
       if (keysHeld['a']) { dx -=  sin; dz +=  cos; }
        if (keysHeld['d']) { dx +=  sin; dz -=  cos;}

        cos = Math.cos(manFacing);
        sin = Math.sin(manFacing);

        manTheta[FigXIdx] = Math.max(0, Math.min(nRows - 2,    manTheta[FigXIdx] + Math.round(dx)));
        manTheta[FigZIdx] = Math.max(0, Math.min(nColumns - 2, manTheta[FigZIdx] + Math.round(dz)));
    }

    if ( walking ) {
        walkAngle += 0.1;

        manTheta[RHipIdx] =  25 * Math.sin( walkAngle );
        manTheta[LHipIdx] = -25 * Math.sin( walkAngle );

        manTheta[RKneeIdx] = -20 * Math.max( 0, Math.sin( walkAngle - 0.6 ) );
        manTheta[LKneeIdx] = -20 * Math.max( 0, Math.sin( -walkAngle - 0.6 ) );

        manTheta[RShoulderIdz] = -20 * Math.sin( walkAngle );
        manTheta[LShoulderIdz] =  20 * Math.sin( walkAngle );
    }

    if ( waving ) {
        waveAngle += 0.05;
        manTheta[RShoulderIdx] = -10 * Math.sin( waveAngle ) -70;
        manTheta[RElbowIdx]    = -35 * Math.sin( waveAngle + 0.8 ) - 70;
        document.getElementById("slider2").value = manTheta[RShoulderIdx];
        document.getElementById("slider3").value = manTheta[RElbowIdx];
    }

   

    //the math conversion from the number with  data/manTheta into world origin stuff
    var manX = 8.0 * manTheta[FigXIdx]/nRows - 4; 
    var manZ = 8.0 * manTheta[FigZIdx]/nColumns - 4;

    manTheta[FigYIdx]= data[manTheta[FigXIdx]][manTheta[FigZIdx]] + BODY_HEIGHT + UPPER_LEG_HEIGHT; 

    // move camera with the man
    at = vec3(manX, manTheta[FigYIdx], manZ);
    eye = vec3( manX + radius * Math.cos(theta) * Math.cos(phi),
                manTheta[FigYIdx] + radius * Math.sin(theta),
                manZ + radius * Math.cos(theta) * Math.sin(phi));

    modelViewMatrix = lookAt(eye, at, up);  

    var eyeSpaceLights = [];
    for (var i = 0; i < numLights; i++) {
        eyeSpaceLights.push(mult(modelViewMatrix, lightPositions[i]));
    }
    gl.useProgram(programT);
    gl.uniform4fv(gl.getUniformLocation(programT, "uLightPosition"), flatten(eyeSpaceLights));
    gl.useProgram(programM);
    gl.uniform4fv(gl.getUniformLocation(programM, "uLightPosition"), flatten(eyeSpaceLights));

    projectionMatrix = perspective(45, canvas.width/canvas.height, 0.1, 500);
    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.useProgram(programS);
    if(isNight){
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureNight);
        drawSkybox(1);
    }
    else{
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureDay);
        drawSkybox(2);
    }
    

    gl.useProgram(programT);
    if (isNight) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureNight);
        gl.uniform1i(gl.getUniformLocation(programT, "uSkybox"), 1);
    } else {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureDay);
        gl.uniform1i(gl.getUniformLocation(programT, "uSkybox"), 2);
    }
    gl.uniformMatrix4fv(modelViewMatrixLocT, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLocT, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLocT, false, flatten(nMatrix));
    drawTerrain();

    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix, translate(manX, manTheta[FigYIdx], manZ));
    var facingDeg = -(manFacing * 180.0 / Math.PI) - 90.0;
    modelViewMatrix = mult(modelViewMatrix, rotate(facingDeg *-1, vec3(0, 1, 0)));
    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.useProgram(programM);
    if (isNight) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureNight);
        gl.uniform1i(gl.getUniformLocation(programM, "uSkybox"), 1);
    } else {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureDay);
        gl.uniform1i(gl.getUniformLocation(programM, "uSkybox"), 2);
    }
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
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function body(){
    var s = scale(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var instanceMatrix = mult( translate( 0.0,  0.0, 0.0 ), s); 
    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv(modelViewMatrixLocM,  false, flatten(t)  );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}     

function upperArmL() {
    var s = scale(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult( translate( -BODY_WIDTH * 0.1, BODY_HEIGHT * 0.41, 0.0 ), mult( rotate( manTheta[LShoulderIdx], vec3(0, 0, 1) ), mult( rotate( manTheta[LShoulderIdz], vec3(1, 0, 0) ), mult( translate( 0.0, -UPPER_ARM_HEIGHT / 2.0, 0.0 ), s ))));
    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true);
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function upperArmR() {
    var s = scale( UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH );
    var instanceMatrix = mult( translate( BODY_WIDTH * 0.1, BODY_HEIGHT * 0.41, 0.0 ),mult( rotate( manTheta[RShoulderIdx], vec3(0, 0, 1) ),mult( rotate( manTheta[RShoulderIdz], vec3(1, 0, 0) ),mult( translate( 0.0, -UPPER_ARM_HEIGHT / 2.0, 0.0 ), s ) ) ) );
    var t = mult( modelViewMatrix, instanceMatrix );
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function lowerArmL() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var shoulderPivot = mult( translate( 0, UPPER_ARM_HEIGHT * 0.85, 0.0 ),
                              mult( rotate( manTheta[LShoulderIdx], vec3(0, 0, 1) ),
                                    rotate( manTheta[LShoulderIdz], vec3(1, 0, 0) ) ) );
    var elbowPivot = mult( shoulderPivot,
                           mult( translate( 0.0, -UPPER_ARM_HEIGHT, 0.0 ),
                                 rotate( manTheta[LElbowIdx], vec3(0, 0, 1) ) ) );
    var instanceMatrix = mult( elbowPivot, mult( translate( 0.0, -LOWER_ARM_HEIGHT / 2.0, 0.0 ), s ) );
    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function lowerArmR() {
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var shoulderPivot = mult( translate( 0.0, UPPER_ARM_HEIGHT * 0.85, 0.0 ),
                              mult( rotate( manTheta[RShoulderIdx], vec3(0, 0, 1) ),
                                    rotate( manTheta[RShoulderIdz], vec3(1, 0, 0) ) ) );
    var elbowPivot = mult( shoulderPivot,
                           mult( translate( 0.0, -UPPER_ARM_HEIGHT, 0.0 ),
                                 rotate( manTheta[RElbowIdx], vec3(0, 0, 1) ) ) );
    var instanceMatrix = mult( elbowPivot, mult( translate( 0.0, -LOWER_ARM_HEIGHT / 2.0, 0.0 ), s ) );
    var t = mult( modelViewMatrix, instanceMatrix );
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv( modelViewMatrixLocM, false, flatten(t) );
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function upperLegR() {
    var s = scale(UPPER_LEG_WIDTH, UPPER_LEG_HEIGHT, UPPER_LEG_WIDTH);
    var instanceMatrix = mult( translate( BODY_WIDTH * 0.8, -BODY_HEIGHT * 0.5, 0.0 ),
                               mult( rotate( manTheta[RHipIdx], vec3(1, 0, 0) ),
                                     mult( translate( 0.0, -UPPER_LEG_HEIGHT / 2.0, 0.0 ), s ) ) );
    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv(modelViewMatrixLocM, false, flatten(t));
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function lowerLegR() {
    var s = scale(LOWER_LEG_WIDTH, LOWER_LEG_HEIGHT, LOWER_LEG_WIDTH);

    var hipPivot  = mult( translate( BODY_WIDTH * 0.8, -BODY_HEIGHT * 0.5, 0.0 ), rotate( manTheta[RHipIdx], vec3(1, 0, 0) ) );

    var kneePivot = mult( hipPivot, mult( translate( 0.0, -UPPER_LEG_HEIGHT, 0.0 ), rotate( manTheta[RKneeIdx], vec3(1, 0, 0) ) ) );

    var instanceMatrix = mult( kneePivot, mult( translate( 0.0, -LOWER_LEG_HEIGHT / 2.0, 0.0 ), s ) );

    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv(modelViewMatrixLocM, false, flatten(t));
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n));
    drawCube();
}

function upperLegL() {
    var s = scale(UPPER_LEG_WIDTH, UPPER_LEG_HEIGHT, UPPER_LEG_WIDTH);
    var instanceMatrix = mult( translate( -BODY_WIDTH * 0.8, -BODY_HEIGHT * 0.5, 0.0 ),
                               mult( rotate( manTheta[LHipIdx], vec3(1, 0, 0) ),
                                     mult( translate( 0.0, -UPPER_LEG_HEIGHT / 2.0, 0.0 ), s ) ) );
    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    gl.uniformMatrix4fv(modelViewMatrixLocM, false, flatten(t));
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}

function lowerLegL() {
    var s = scale(LOWER_LEG_WIDTH, LOWER_LEG_HEIGHT, LOWER_LEG_WIDTH);

    var hipPivot  = mult( translate( -BODY_WIDTH * 0.8, -BODY_HEIGHT * 0.5, 0.0 ), rotate( manTheta[LHipIdx], vec3(1, 0, 0) ) );

    var kneePivot = mult( hipPivot, mult( translate( 0.0, -UPPER_LEG_HEIGHT, 0.0 ),rotate( manTheta[LKneeIdx], vec3(1, 0, 0) ) ) );

    var instanceMatrix = mult( kneePivot, mult( translate( 0.0, -LOWER_LEG_HEIGHT / 2.0, 0.0 ), s ) );

    var t = mult(modelViewMatrix, instanceMatrix);
    var n = normalMatrix(t, true); 
    var n = normalMatrix(t, true);
    gl.uniformMatrix4fv(modelViewMatrixLocM, false, flatten(t));
    gl.uniformMatrix3fv(nMatrixLocM, false, flatten(n)); 
    drawCube();
}
function drawMan() {
    head();
    body();
    upperArmL();
    lowerArmL();
    upperArmR();
    lowerArmR();
    upperLegR();
    lowerLegR();
    upperLegL();
    lowerLegL();
}

}

Program3();




