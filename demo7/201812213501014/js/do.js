"use strict";

const{vec3, vec4, mat3, mat4, vec2, quat} = glMatrix;

var canvas;
var gl;
var programskybox;
var fileInput;
var textureFileInput;
var bumpFileInput;

var meshdata = null;
var mesh = null;
var meshinited = false;

var texture = null;
var texImage = null;
var bumpTexture = null;
var bumpTexImage = null;

var cubemapTexture = null;

var points = [];
var colors = [];
var acolor = [];
var lineIndex = [];

var color;

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();
var invModelViewMatrix = mat4.create();

var vBuffer = null;
var vPosition = null;
var cBuffer = null;
var vColor = null;

var lineCnt = 0;

var stept = 5.0 * Math.PI / 180.0;

// var fovy = 45.0 * Math.PI/180.0;
// var left = -2.0;
// var right = 2.0;
// var ytop = 2.0;


// var pnear = 0.01;
// var pfar = 20;

var dxt = 0.0;
var dyt = 0.0;
var dzt = 0.0;
var step = 0.2;

var dx = 0.0;
var dy = 0.0;
var dz = 0.0;
var dirx = 1;
var diry = 1;

var sx = 1;
var sy = 1;
var sz = 1;

var eye = vec3.fromValues(0.0, 0.0, 1.0);
var at = vec3.fromValues(0.0, 0.0, 0.0);
var up = vec3.fromValues(0.0, 1.0, 0.0);

var rquat = quat.create();

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var currentKey = [];


var projectionType = 1; 
var drawType = 1; 
var viewType = [0];
var viewcnt = 0;

var changePos = 1;

var currentColor = vec4.fromValues(1.0, 0.0, 0.0, 1.0);
var textureAlpha = 1.0;
var bumpDepth = 0;

var program = null;

var normals = [];
var normalLoc = null;

var materialKaLoc = null;
var materialKdLoc = null;
var materialKsLoc = null;

var ambientProdLoc = null;
var diffuseProdLoc = null;
var specularProdLoc = null;

var modelViewMatrixLoc = null;
var projectionMatrixLoc = null;
var normalMatrixLoc = null;
var invModelViewMatrixLoc = null;

var lightPositionLoc = null;
var shininessLoc = null;

var iBuffer = null;
var nBuffer = null;

var lightPosition = vec4.create();
var lightAmbient = vec4.create();
var lightDiffuse = vec4.create();
var lightSpecular = vec4.create();

var mka = 1.0;
var mkd = 1.0;
var mks = 1.0;
var mksh = 128;

var materialAmbient = vec4.create();
var materialDiffuse = vec4.create();
var materialSpecular = vec4.create();
var materialShininess = 1.0;

var clearColor = vec4.fromValues(0.7, 0.7, 0.7, 1.0);
var shininess = 1.0;
var materialKa = 1.0;
var materialKd = 1.0;
var materialKs = 1.0;

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();
var normalMatrix = mat3.create(); 

var meshNormalBuffer = null;
var meshTextureBuffer = null;
var meshVertexBuffer = null;
var meshIndexBuffer = null;

var side = 100;
var texCoords = [];

var skyboxPoints = [];
var skyboxNormals = [];
var skyboxtexCoords = [];
var skyboxIndices = [];

var matShininess = 1.0;
var matSmoothness = 0;
var shadowDepth = 0;

var averageBrightness = 0.0;
var maxBrightness = 0.0;

var skyboxModelViewMatrix = mat4.create();
var skyboxProjectionMatrix = mat4.create();

var positionLoc = null;
var skyboxvBuffer = null;
var skyboxnBuffer = null;
var skyboxiBuffer = null;
var skyboxpointsLoc = null;
var skyboxnormalsLoc = null;
var skyboxtexcoordsLoc = null;

var colorLoc = null;
var length = 20;
var left = -length;
var right = length;
var ytop = length;
var ybottom = -length;
var near = -length;
var far = length;
var pnear = 0.01;
var pfar = 200;
var radius = 5;
var theta = 0.0;
var phi = 0.0;
var fovy = 60 * Math.PI / 180.0;
var aspect;

// move object
function handleKeyDown() {
	var key = event.keyCode;
	event.preventDefault();
	// console.log(event);
	currentKey[key] = true;
	switch (key) {
		case 65: //left//a
			dx -= step;
			document.getElementById("xpos").value = dx;
			break;
		case 68: // right//d
			dx += step;
			document.getElementById("xpos").value = dx;
			break;
		case 87: // up//w
			dy += step;
			document.getElementById("ypos").value = dy;
			break;
		case 83: // down//s
			dy -= step;
			document.getElementById("ypos").value = dy;
			break;
		case 90: // a//z
			dz += step;
			document.getElementById("zpos").value = dz;
			break;
		case 88: // d//x
			dz -= step;
			document.getElementById("zpos").value = dz;
			break;

		case 107: case 61: // + // radius ++
			radius += step;
			document.getElementById("radius").value=radius;
			break;
		case 109: case 173: // - // radius --
			radius -= step;
			document.getElementById("radius").value=radius;
			break;
		case 82: // r//reset
			dx = dy = dz = 0;
			dxt = dyt = dzt = 0;
			theta = phi = 0.0;
			radius = 6.0;
			document.getElementById("xpos").value = dx;
			document.getElementById("ypos").value = dy;
			document.getElementById("zpos").value = dz;			
			document.getElementById("xrot").value = dxt;
			document.getElementById("yrot").value = dyt;
			document.getElementById("zrot").value = dzt;
			document.getElementById("theta").value = theta;
			document.getElementById("phi").value = phi;
			document.getElementById("radius").value = radius;
			break;
	}
	// requestAnimFrame(render);
	buildModelViewProj();
}


function handleKeyUp(event) {
	currentKey[event.keyCode] = false;
}

function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	mouseDown = false;
}

function handleMouseMove(event) {
	if (!mouseDown)
		return;

	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = (newX - lastMouseX);
	var d = deltaX;
	theta = theta - parseFloat(d);

	var deltaY = (newY - lastMouseY);
	d = deltaY;
	phi = phi - parseFloat(d);

	lastMouseX = newX;
	lastMouseY = newY;
	buildModelViewProj();
}

function checkInput(){
	var ptype = document.getElementById("ortho").checked;
	if(ptype) {
		projectionType = 1;
	}else{
		if(document.getElementById("persp").checked)
			projectionType = 2;
	}

	var dtype = document.getElementById("wire").checked;
	if(dtype){
		drawType = 1;
	}else{
		if(document.getElementById("solid").checked)
			drawType = 2;
	}

	var hexcolor = document.getElementById("objcolor").value.substring(1);
	var rgbHex = hexcolor.match(/.{1,2}/g);
	currentColor = vec4.fromValues( 
		parseInt(rgbHex[0], 16)/255.0,
		parseInt(rgbHex[1], 16)/255.0,
		parseInt(rgbHex[2], 16)/255.0,
		1.0
	);
}

window.onload = function initWindow(){
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	// gl.viewport(0, 0, canvas.width, canvas.width);
	gl.clearColor(0.7, 0.7, 0.7, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	// gl.enable(gl.CULL_FACE);
	
	programskybox = initShaders( gl, "vshader-skybox", "fshader-skybox" );
	gl.useProgram( programskybox );

	skyboxpointsLoc = gl.getAttribLocation( programskybox, "vPosition" );
	skyboxtexcoordsLoc = gl.getAttribLocation(programskybox, "vTexCoords" );

	program = initShaders( gl, "vshader-objtex", "fshader-objtex" );
	gl.useProgram( program ); // 可更改
	
	positionLoc = gl.getAttribLocation( program, "vPosition" );
	normalLoc = gl.getAttribLocation( program, "vNormal" );

	
	checkInput();
	initInterface();
	initCoefficients();	
	configureCubeMapTexture();
	
	if( texture === null ){
	    var url = "./textures/world.jpg";
	    configureTexture( url );
	}
	if( bumpTexture === null ){
	    var url = "./textures/roof.jpg";
	    configureBumpTexture(url);
	}
	
	buildSkyBox();
	initObjBuffers();
	buildModelViewProj();
}

function initObjBuffers(){
	meshNormalBuffer = gl.createBuffer();
	meshTextureBuffer = gl.createBuffer();
	meshVertexBuffer = gl.createBuffer();
	meshIndexBuffer = gl.createBuffer();
}

function initInterface(){
	fileInput = document.getElementById("fileInput");
	fileInput.addEventListener("change", function (event) {
		var file = fileInput.files[0];
		var reader = new FileReader();

		reader.onload = function (event) {
			meshdata = reader.result;
			initObj();
		}
		reader.readAsText(file);
	});
	
	textureFileInput = document.getElementById("textureInput");
	textureFileInput.addEventListener("change", function(event){
		var file = textureFileInput.files[0];
		var prehead = "./textures/";
		var imgurl = prehead.concat(file.name);
		configureTexture( imgurl );
	});
	
	bumpFileInput = document.getElementById("bumpInput");
	bumpFileInput.addEventListener("change", function(event){
		var file = bumpFileInput.files[0];
		var prehead = "./textures/";
		var imgurl = prehead.concat(file.name);
		configureBumpTexture( imgurl );
	});
	
	initShapeVal();
	initBeamVal();

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
}

function buildMultiViewProj(type){
	if(type[0] == 0)
		render();
	else
		rendermultiview();
}

function initObj(){
	// read obj file, initialize points, vertex coordinates, colors
	mesh = new OBJ.Mesh( meshdata );
	//OBJ.initMeshBuffers( gl, mesh );

	// normalize all vertex position into [-1,1], and center at [0,0,0]
	dx = -1.0 * (parseFloat(mesh.xmax) + parseFloat(mesh.xmin))/2.0;
	dy = -1.0 * (parseFloat(mesh.ymax) + parseFloat(mesh.ymin))/2.0;
	dz = -1.0 * (parseFloat(mesh.zmax) + parseFloat(mesh.zmin))/2.0;

	var maxScale;
	var scalex = Math.abs(parseFloat(mesh.xmax)-parseFloat(mesh.xmin));
	var scaley = Math.abs(parseFloat(mesh.ymax)-parseFloat(mesh.ymin));
	var scalez = Math.abs(parseFloat(mesh.zmax)-parseFloat(mesh.zmin));

	maxScale = Math.max(scalex, scaley, scalez);

	sx =  2.0/maxScale;
	sy =  2.0/maxScale;
	sz =  2.0/maxScale;
	meshinited = true;

	updateModelData();
	buildModelViewProj();
	// updateColor();

	render();
}

function updateModelData(){
	if(vBuffer === null)
		vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vBuffer);
	lineIndex = [];
	for(var i = 0; i < mesh.indices.length; i+=3){
		lineIndex.push(mesh.indices[i], mesh.indices[i+1]);
		lineIndex.push(mesh.indices[i+1], mesh.indices[i + 2]);
		lineIndex.push(mesh.indices[i+2], mesh.indices[i]);
	}
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndex), gl.STATIC_DRAW);
}

function updateColor(){
	var bcolor = [];
	for (var i = 0; i < mesh.vertexBuffer.numItems; i++)
		bcolor.push(currentColor[0], currentColor[1], currentColor[2], currentColor[3]);

	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bcolor), gl.STATIC_DRAW);

	vColor = gl.getAttribLocation(program, "vColor",);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

function buildModelViewProj(){
	var rthe = theta * Math.PI / 180.0;
	var rphi = phi * Math.PI / 180.0;

	vec3.set(eye, radius * Math.sin(rthe) * Math.cos(rphi), radius * Math.sin(rthe) * Math.sin(rphi), radius * Math.cos(rthe)); 
	
	mat4.lookAt( modelViewMatrix, eye, at, up );

	skyboxModelViewMatrix = mat4.clone( modelViewMatrix );
	for( var i = 12; i <= 14; i++ )
		 skyboxModelViewMatrix[i]=0;
	mat4.translate( modelViewMatrix, modelViewMatrix, vec3.fromValues( dx, dy, dz ) );
	mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(sx, sy, sz));  
	aspect = 1;
	mat4.perspective(projectionMatrix, fovy, aspect, pnear, pfar);

	mat3.fromMat4(normalMatrix, modelViewMatrix);
	
	mat3.normalFromMat4(invModelViewMatrix, modelViewMatrix);
	mat3.transpose(invModelViewMatrix, invModelViewMatrix);

	// mat4.ortho(projectionMatrix, left, right, bottom, ytop, near, far);
	
	render();
}

function drawSkybox(){
	//gl.cullFace(gl.FRONT);
	gl.useProgram( programskybox );
	gl.uniformMatrix4fv(gl.getUniformLocation(programskybox, "projectionMatrix"), false, new Float32Array(projectionMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(programskybox, "modelViewMatrix"), false, new Float32Array(skyboxModelViewMatrix));
	
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, skyboxnBuffer );
	gl.enableVertexAttribArray( skyboxnormalsLoc );
	gl.bindBuffer( gl.ARRAY_BUFFER, skyboxvBuffer );
	gl.vertexAttribPointer( skyboxpointsLoc, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( skyboxpointsLoc);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxiBuffer);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );
	gl.disableVertexAttribArray(skyboxpointsLoc);
	gl.disableVertexAttribArray(skyboxnormalsLoc);
	//console.log("Skybox");
}

function drawObject(){
	gl.useProgram( program );

	gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, new Float32Array(modelViewMatrix));

	gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, new Float32Array(projectionMatrix));

	gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix"), false, new Float32Array(normalMatrix));

	gl.uniform3fv( gl.getUniformLocation( program, "lightPos"), new Float32Array( eye ) );

	gl.uniform4fv(gl.getUniformLocation( program, "fColor" ), new Float32Array( currentColor ) );
	gl.uniform1f(gl.getUniformLocation(program,"textureAlpha"), textureAlpha);
	gl.uniform1f(gl.getUniformLocation(program,"shininess"), matShininess);
	gl.uniform1f(gl.getUniformLocation(program, "bumpDepth"), bumpDepth);
	if( meshinited === true ){
		gl.activeTexture( gl.TEXTURE1 );
		gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
		
		gl.activeTexture( gl.TEXTURE2 );
		gl.bindTexture( gl.TEXTURE_2D, texture );

		gl.activeTexture( gl.TEXTURE3 );
		gl.bindTexture( gl.TEXTURE_2D, bumpTexture );
		
		if( mesh.inited === false ){
			gl.uniform1i( gl.getUniformLocation( program, "texCubemap" ), 1 );
			gl.uniform1i( gl.getUniformLocation( program, "texture" ), 2 );
			gl.uniform1i( gl.getUniformLocation( program, "texbump" ), 3 );
		
			OBJ.initMeshBuffers(gl, mesh);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer );
			gl.vertexAttribPointer(normalLoc, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(normalLoc);
			gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexBuffer );
			gl.vertexAttribPointer( positionLoc, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray(positionLoc);
		}
		// gl.bindBuffer( gl.ARRAY_BUFFER, mesh.normalBuffe);
		// gl.vertexAttribPointer(normalLoc, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0 );
		// gl.enableVertexAttribArray(normalLoc);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer );
		gl.enableVertexAttribArray(normalLoc);
		gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexBuffer );
		gl.enableVertexAttribArray(positionLoc);  
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
		// gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		renderType(drawType);
		gl.disableVertexAttribArray(positionLoc);
		gl.disableVertexAttribArray(normalLoc);
	}
}

function render(){
	gl.viewport( 0, 0, canvas.width, canvas.height );
	// aspect = canvas.width / canvas.height;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawSkybox();
	drawObject();
}

function renderType(type){
	if (type == 1) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vBuffer);
		gl.drawElements(gl.LINES, lineIndex.length, gl.UNSIGNED_SHORT, 0);
	} else {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}

function initShapeVal(){
	var projradios = document.getElementsByName("projtype");
	for (var i = 0; i < projradios.length; i++) {
		projradios[i].addEventListener("click", function (event) {
			var value = this.value;
			if (this.checked) {
				projectionType = parseInt(value);
			}
			buildModelViewProj();
		});
	}
	
	var drawradios = document.getElementsByName("drawtype");
	for (var i = 0; i < drawradios.length; i++) {
		drawradios[i].addEventListener("click", function (event) {
			var value = this.value;
			if (this.checked) {
				drawType = parseInt(value);
			}
			render();
		});
	}
	
	document.getElementById("objcolor").addEventListener("input", function (event) {
		var hexcolor = this.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		currentColor = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
		// updateColor();
		render();
	});
	
	document.getElementById("xpos").addEventListener("input", function(event){
		dx = this.value;
		buildModelViewProj();
	});
	document.getElementById("ypos").addEventListener("input", function(event){
		dy = this.value;
		buildModelViewProj();
	});
	document.getElementById("zpos").addEventListener("input", function(event){
		dz = this.value;
		buildModelViewProj();
	});
	
	document.getElementById("xrot").addEventListener("input", function(event){
		dxt = this.value;
		buildModelViewProj();
	});
	document.getElementById("yrot").addEventListener("input", function(event){
		dyt = this.value;
		buildModelViewProj();
	});
	document.getElementById("zrot").addEventListener("input",function(event){
		dzt = this.value;
		buildModelViewProj();
	});
	
	var postypeRadio = document.getElementsByName("posgrp");
	for (var i = 0; i < postypeRadio.length; i++) {
		postypeRadio[i].addEventListener("click", function (event) {
			var value = this.value;
			if (this.checked) {
				changePos = parseInt(value);
			}
		});
	}
}

function initBeamVal(){
	document.getElementById("slider-ka").addEventListener("input", function(event){
		var vka = event.target.value;
		materialKa = parseFloat(vka);
		document.getElementById("slider-ka-value").innerHTML = materialKa;
		buildModelViewProj();
	});
	
	document.getElementById("slider-kd").addEventListener("input", function(event){
		var vkd = event.target.value;
		materialKd = parseFloat(vkd);
		document.getElementById("slider-kd-value").innerHTML = materialKd;
		buildModelViewProj();
	});
	
	document.getElementById("slider-ks").addEventListener("input", function(event){
		var vks = event.target.value;
		materialKs = parseFloat(vks);
		document.getElementById("slider-ks-value").innerHTML = materialKs;
		buildModelViewProj();
	});
	
	document.getElementById("slider-sh").addEventListener("input", function(event){
		var vksh = event.target.value;
		materialShininess = parseInt(vksh);
		document.getElementById("slider-sh-value").innerHTML = materialShininess;
		buildModelViewProj();
	});
	
	document.getElementById("ka-color").addEventListener("input", function(event){
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		materialAmbient = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
		buildModelViewProj();
	});
	
	document.getElementById("kd-color").addEventListener("input", function (event) {
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		materialDiffuse = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
		buildModelViewProj();
	});
	
	document.getElementById("ks-color").addEventListener("input", function (event) {
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		materialSpecular = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
		buildModelViewProj();
	});
	
	document.getElementById("bk-color").addEventListener("input", function (event) {
		//var hexcolor = document.getElementById("bk-color").value.substring(1);
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		clearColor = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
	});
	
	document.getElementById("lt-ambient-color").addEventListener("input", function(event){
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		lightAmbient = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
	});
	
	document.getElementById("lt-diffuse-color").addEventListener("input", function (event) {
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		lightDiffuse = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
	});
	
	document.getElementById("lt-specular-color").addEventListener("input", function (event) {
		var hexcolor = event.target.value.substring(1);
		var rgbHex = hexcolor.match(/.{1,2}/g);
		lightSpecular = vec4.fromValues(
			parseInt(rgbHex[0], 16) * 1.0 / 255.0,
			parseInt(rgbHex[1], 16) * 1.0 / 255.0,
			parseInt(rgbHex[2], 16) * 1.0 / 255.0,
			1.0
		);
	});
	
	document.getElementById("slider-x").addEventListener("input", function(event){
		var lx = parseFloat(event.target.value);
		lightPosition[0] = lx;
		document.getElementById("slider-x-value").innerHTML = lx;
	});
	
	document.getElementById("slider-y").addEventListener("input", function (event) {
		var ly = parseFloat(event.target.value);
		lightPosition[1] = ly;
		document.getElementById("slider-y-value").innerHTML = ly;
	});
	
	document.getElementById("slider-z").addEventListener("input", function (event) {
		var lz = parseFloat(event.target.value);
		lightPosition[2] = lz;
		document.getElementById("slider-z-value").innerHTML = lz;
	});
}


function initCoefficients() {
	// // modeVal: use vert and frag shadders
	// var d = parseInt( document.getElementById("select_shader_id").value );
	// modeVal = d;

	// // colorMode: ambient + diffuse + specular
	// d = parseInt( document.getElementById( "select_color_id" ).value );
	// colorMode = d;

	// material
	mka = parseFloat(document.getElementById("slider-ka").value);
	materialKa = mka;

	mkd = parseFloat(document.getElementById("slider-kd").value);
	materialKd = mkd;

	mks = parseFloat(document.getElementById("slider-ks").value);
	materialKs = mks;

	materialShininess = parseInt(document.getElementById("slider-sh").value);

	// set material color
	var ambhexcolor = document.getElementById("ka-color").value.substring(1).match(/.{1,2}/g);
	materialAmbient = vec4.fromValues(
		parseInt(ambhexcolor[0], 16) * 1.0 / 255.0,
		parseInt(ambhexcolor[1], 16) * 1.0 / 255.0,
		parseInt(ambhexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var difhexcolor = document.getElementById("kd-color").value.substring(1).match(/.{1,2}/g);
	materialDiffuse = vec4.fromValues(
		parseInt(difhexcolor[0], 16) * 1.0 / 255.0,
		parseInt(difhexcolor[1], 16) * 1.0 / 255.0,
		parseInt(difhexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var spehexcolor = document.getElementById("ks-color").value.substring(1).match(/.{1,2}/g);
	materialSpecular = vec4.fromValues(
		parseInt(spehexcolor[0], 16) * 1.0 / 255.0,
		parseInt(spehexcolor[1], 16) * 1.0 / 255.0,
		parseInt(spehexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var ltx = parseFloat(document.getElementById("slider-x").value);
	var lty = parseFloat(document.getElementById("slider-y").value);
	var ltz = parseFloat(document.getElementById("slider-z").value);
	lightPosition = vec4.fromValues(ltx, lty, ltz, 1.0);

	// set light color
	var lambhexcolor = document.getElementById("lt-ambient-color").value.substring(1).match(/.{1,2}/g);
	lightAmbient = vec4.fromValues(
		parseInt(lambhexcolor[0], 16) * 1.0 / 255.0,
		parseInt(lambhexcolor[1], 16) * 1.0 / 255.0,
		parseInt(lambhexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var ldifhexcolor = document.getElementById("lt-diffuse-color").value.substring(1).match(/.{1,2}/g);
	lightDiffuse = vec4.fromValues(
		parseInt(ldifhexcolor[0], 16) * 1.0 / 255.0,
		parseInt(ldifhexcolor[1], 16) * 1.0 / 255.0,
		parseInt(ldifhexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var lspehexcolor = document.getElementById("lt-specular-color").value.substring(1).match(/.{1,2}/g);
	lightSpecular = vec4.fromValues(
		parseInt(lspehexcolor[0], 16) * 1.0 / 255.0,
		parseInt(lspehexcolor[1], 16) * 1.0 / 255.0,
		parseInt(lspehexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);

	var cchexcolor = document.getElementById("bk-color").value.substring(1).match(/.{1,2}/g);
	clearColor = vec4.fromValues(
		parseInt(cchexcolor[0], 16) * 1.0 / 255.0,
		parseInt(cchexcolor[1], 16) * 1.0 / 255.0,
		parseInt(cchexcolor[2], 16) * 1.0 / 255.0,
		1.0
	);
}

function isPowerOf2( value ){
	return (value & (value - 1)) == 0;
}
function requestCORSIfNotSameOrigin(img, url) {
	if ((new URL(url, window.location.href)).origin !== window.location.origin) {
	  img.crossOrigin = "";
	}
}

function configureTexture( url ){
	texture = gl.createTexture();
	//gl.activeTexture( gl.TEXTURE1 );
	texImage = null;
	texImage = new Image();
	texImage.onload = function(){
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage );

		if(isPowerOf2(texImage.width) && isPowerOf2(texImage.height)){
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		}else{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	requestCORSIfNotSameOrigin(texImage, url);
	texImage.src = url;
}

function configureBumpTexture( url ){
	bumpTexture = gl.createTexture();
	//gl.activeTexture( gl.TEXTURE1 );
	bumpTexImage = null;
	bumpTexImage = new Image();
	bumpTexImage.onload = function(){
		gl.bindTexture( gl.TEXTURE_2D, bumpTexture );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bumpTexImage );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	};
	requestCORSIfNotSameOrigin(bumpTexImage, url);
	bumpTexImage.src = url;
}

var faceUrl = [
	'./textures/pos-x.jpg',
	'./textures/neg-x.jpg',
	'./textures/neg-y.jpg',
	'./textures/pos-y.jpg',
	'./textures/pos-z.jpg',
	'./textures/neg-z.jpg',
];

var cubemap_image_cnt = 0;    
var cubemap_image = [];

function configureCubeMapTexture(){
	cubemapTexture = gl.createTexture();
	//gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
	for( var i = 0; i < 6; i++ ){
		cubemap_image[i] = new Image();
		cubemap_image[i].onload = function(){ 
			if( ++cubemap_image_cnt<6)
				return;
			
			var totalBrightness = 0;
			var thiscanvas;

			for( var k = 0; k < 6; k++ ){
				
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + k , 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubemap_image[k] );
				
				thiscanvas = document.createElement("canvas");
				thiscanvas.width = cubemap_image[k].width;
				thiscanvas.height = cubemap_image[k].height;
				var context = thiscanvas.getContext("2d");
				context.drawImage(cubemap_image[k], 0, 0 );
				var imgData = context.getImageData(0, 0, thiscanvas.width, thiscanvas.height);
				
				for( var x = 0, width = imgData.width; x < width; x++ ){
					for( var y = 0, height = imgData.height; y < height; y++ ){
						var p = (y*width+x)*4;
						var brightness = (imgData.data[p] + imgData.data[p+1] + imgData.data[p+2])/(255*3);
						maxBrightness = Math.max( maxBrightness, brightness );
						totalBrightness += brightness;
					}
				}
			}
			averageBrightness = totalBrightness / (imgData.width * imgData.height * 6);
			
			gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
			gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
			gl.uniform1f(gl.getUniformLocation(program,"averageBrightness"), averageBrightness);
			gl.uniform1f(gl.getUniformLocation(program,"maxBrightness"), maxBrightness);
		}
		requestCORSIfNotSameOrigin(cubemap_image[i], faceUrl[i]);
		cubemap_image[i].src = faceUrl[i];
	}
}

function buildSkyBox(){
	var vertices = [
	-side, -side,  side,
	-side,  side,  side,
	 side,  side,  side,
	 side, -side,  side,
	-side, -side, -side,
	-side,  side, -side,
	 side,  side, -side,
	 side, -side, -side
	];

	var indices = [
		1, 0, 3,
		3, 2, 1, //front
		2, 3, 7,
		7, 6, 2, //right
		3, 0, 4,
		4, 7, 3, //bottom
		6, 5, 1,
		1, 2, 6, //top
		4, 5, 6,
		6, 7, 4, //back
		5, 4, 0,
		0, 1, 5 //left
	];

	var texCoord = [
		vec2.fromValues( 0, 0 ),
		vec2.fromValues( 0, 1 ),
		vec2.fromValues( 1, 1 ),
		vec2.fromValues( 1, 0 )
	];

	var texCoordID = [
		0, 1, 2, 0, 2, 3
	];

	var fnormals = [
		vec3.fromValues( 0, 0, 1 ),
		vec3.fromValues( 1, 0, 0 ),
		vec3.fromValues( 0, -1, 0 ),
		vec3.fromValues( 0, 1, 0 ),
		vec3.fromValues( 0, 0, -1 ),
		vec3.fromValues( -1, 0, 0 )
	];

	for( var i = 0; i < vertices.length; i++ )
		skyboxPoints.push( vertices[i] );
	for( var i = 0; i < indices.length; i++ ){
		//skyboxPoints.push( vertices[indices[i]][0], vertices[indices[i]][1], vertices[indices[i]][2] );
		var texid = texCoordID[ i%6 ];
		var fnid = parseInt(i/6);
		//skyboxtexCoords.push( texCoord[ texid ][0], texCoord[ texid ][1] );
		skyboxNormals.push( fnormals[fnid][0], fnormals[fnid][1], fnormals[fnid][2] );
		skyboxIndices.push(indices[i]);
	}

	skyboxvBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, skyboxvBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(skyboxPoints), gl.STATIC_DRAW );

	gl.vertexAttribPointer( skyboxpointsLoc, 3, gl.FLOAT, false, 0, 0 );
	//gl.enableVertexAttribArray( skyboxpointsLoc);

	skyboxnBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, skyboxnBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(skyboxNormals), gl.STATIC_DRAW );

	gl.vertexAttribPointer( skyboxnormalsLoc, 3, gl.FLOAT, false, 0, 0);
	//gl.enableVertexAttribArray( skyboxnormalsLoc );

	skyboxiBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, skyboxiBuffer );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(skyboxIndices), gl.STATIC_DRAW );

	if(cubemapTexture){
		gl.useProgram(programskybox);
		gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
		gl.uniform1i( gl.getUniformLocation( programskybox, "texCubemap" ), 0 );
	}
	//gl.uniform1i( gl.getUniformLocation( programskybox, "texCubemap" ), 0 );
	
}




