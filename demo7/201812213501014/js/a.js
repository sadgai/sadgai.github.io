"use strict";

const {
    vec2,vec3, vec4, mat4
} = glMatrix;

var canvas;
var gl;

var numOfSubdivides = 6;

var points = [];
var colors = [];
var texCoords = [];
var index = 0;
var texCoord = [
    vec2.fromValues( 0, 0 ),
    vec2.fromValues( 0, 1 ),
    vec2.fromValues( 1, 0 ),
    vec2.fromValues( 1, 0 ),
    vec2.fromValues( 0, 1 ),
    vec2.fromValues( 1, 1 )
];
var va = vec4.fromValues(0.0, 0.0, -1.0, 1);
var vb = vec4.fromValues(0.0, 0.942809, 0.333333, 1);
var vc = vec4.fromValues(-0.816479, -0.471405, 0.333333, 1);
var vd = vec4.fromValues(0.816479, -0.471405, 0.333333, 1);
var cBuffer = null;
var tBuffer = null;
var vBuffer = null;
var vPosition = null;
var vColor = null;
var vTexCoord;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var near = -10;
var far = 10;
var radius = 6.0;
var theta = 0.0;
var phi = 0.0;
var stept = 5.0 * Math.PI / 180.0;


var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;


var dxt = 0.0;
var dyt = 0.0;
var dzt = 0.0;
var stepm = 0.2;

var dxm = 0.0;
var dym = 0.0;
var dzm = 0.0;

var eye;
var at = vec3.fromValues(0.0, 0.0, 0.0);
var up = vec3.fromValues(0.0, 1.0, 0.0);

var currentKey = [];
var c;
var texSize = 4;
var texture1;
var texture2;
var image1 = new Uint8Array(4 * texSize * texSize);
for(var i=0;i<texSize;i++){
    for(var j=0;j<texSize;j++){
        c = 255*(((i & 0x20) == 0) ^ ((j & 0x20)  == 0))
        image1[4*i*texSize+4*j] = c;
        image1[4*i*texSize+4*j+1] = c;
        image1[4*i*texSize+4*j+2] = c;
        image1[4*i*texSize+4*j+3] = 255;
    }
}
var image2 = new Uint8Array(4 * texSize * texSize);
for (var i=0;i<texSize;i++){
    for (var j=0;j<texSize;j++){
        image2[4*i*texSize+4*j] = 127+127*Math.sin(0.1*i*j);
        image2[4*i*texSize+4*j+1] = 127+127*Math.sin(0.1*i*j);
        image2[4*i*texSize+4*j+2] = 127+127*Math.sin(0.1*i*j);
        image2[4*i*texSize+4*j+3] = 255;
    }
}
// move object
function handleKeyDown() {
    var key = event.keyCode;
    currentKey[key] = true;
    switch (key) {
        case 86: // v //increase divide
            numOfSubdivides++;
            index = 0;
            points = [];
            
            divideTetra(va, vb, vc, vd, numOfSubdivides);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
            break;
        case 66: // b  //decrease divide
            if (numOfSubdivides)
                numOfSubdivides--;
            index = 0;
            points = [];
            divideTetra(va, vb, vc, vd, numOfSubdivides);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
            break;
    }
    requestAnimFrame(render);
}

function handleKeyUp() {
    currentKey[event.keyCode] = false;
}

function triangle(a, b, c) {
    points.push(a[0], a[1], a[2], a[3]);
    texCoords.push( texCoord[ 0 ][0], texCoord[ 0 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(b[0], b[1], b[2], b[3]);
    texCoords.push( texCoord[ 1 ][0], texCoord[ 1 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(b[0], b[1], b[2], b[3]);
    texCoords.push( texCoord[ 2 ][0], texCoord[ 2 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(c[0], c[1], c[2], c[3]);
    texCoords.push( texCoord[ 3 ][0], texCoord[ 3 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(c[0], c[1], c[2], c[3]);
    texCoords.push( texCoord[ 4 ][0], texCoord[ 4 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(a[0], a[1], a[2], a[3]);
    texCoords.push( texCoord[ 5 ][0], texCoord[ 5 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    index += 6;
}

function divideTriangle(a, b, c, n) {
    if (n > 0) {
        var ab = vec4.create();
        vec4.lerp(ab, a, b, 0.5);
        var abt = vec3.fromValues(ab[0], ab[1], ab[2]);
        vec3.normalize(abt, abt);
        vec4.set(ab, abt[0], abt[1], abt[2], 1.0);

        var bc = vec4.create();
        vec4.lerp(bc, b, c, 0.5);
        var bct = vec3.fromValues(bc[0], bc[1], bc[2]);
        vec3.normalize(bct, bct);
        vec4.set(bc, bct[0], bct[1], bct[2], 1.0);

        var ac = vec4.create();
        vec4.lerp(ac, a, c, 0.5);
        var act = vec3.fromValues(ac[0], ac[1], ac[2]);
        vec3.normalize(act, act);
        vec4.set(ac, act[0], act[1], act[2], 1.0);

        divideTriangle(a, ab, ac, n - 1);
        divideTriangle(ab, b, bc, n - 1);
        divideTriangle(bc, c, ac, n - 1);
        divideTriangle(ab, bc, ac, n - 1);
    } else {
        triangle(a, b, c);
    }
}

function divideTetra(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}
function configureTexture(){
    texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	// gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1 );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1 );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	
    texture2= gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	// gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2s );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2 );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	
}
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.width);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    divideTetra(va, vb, vc, vd, numOfSubdivides);

    cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

	vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );   

    configureTexture();

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, points.length/4);
    requestAnimFrame(render);
}