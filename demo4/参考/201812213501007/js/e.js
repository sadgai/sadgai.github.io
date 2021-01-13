"use strict";

var canvas;
var gl;
var cBuffer;
var vBuffer;
var points = [];
var maxNumTriangles = 500;
var maxNumVertices = 3 * maxNumTriangles;
var posLoc;
var index;//记录选择
var thetaforSquare = 0.0;
var thetaforCube = 0.0;
var graph = []; // 用于记录所需绘制的图形数量和种类
var thetaLoc;
var s = [1.0, 1.0, 1.0];//缩放
var sLoc;
var pointIndex = 0;//总共点个数
var translation = 0;//平移
var steps = 0.003;//平移的步长
var trianglePoints = [//三角形的图形
    0.0, 0.1, 0.0,
    -0.1, -0.1, 0.0,
    0.1, -0.1, 0.0
];
var squarePoints = [//矩形的图形
    0.0, 0.1, 0.0,
    -0.1, 0.0, 0.0,
    0.1, 0.0, 0.0,
    -0.1, 0.0, 0.0,
    0.1, 0.0, 0.0,
    0.0, -0.1, 0.0
];
var circlePoints = [];

var side = 6;
var color = [0.0, 0.0, 0.0, 1.0];
var vertices = [
    glMatrix.vec4.fromValues(-0.2, -0.2, 0.2, 1.0),
    glMatrix.vec4.fromValues(-0.2, 0.2, 0.2, 1.0),
    glMatrix.vec4.fromValues(0.2, 0.2, 0.2, 1.0),
    glMatrix.vec4.fromValues(0.2, -0.2, 0.2, 1.0),
    glMatrix.vec4.fromValues(-0.2, -0.2, -0.2, 1.0),
    glMatrix.vec4.fromValues(-0.2, 0.2, -0.2, 1.0),
    glMatrix.vec4.fromValues(0.2, 0.2, -0.2, 1.0),
    glMatrix.vec4.fromValues(0.2, -0.2, -0.2, 1.0),
];
var vertexColors = [
    glMatrix.vec4.fromValues(1.0, 0.0, 1.0, 1.0),  // magenta
    glMatrix.vec4.fromValues(0.0, 1.0, 1.0, 1.0),  // cyan
    glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0),  // blue
    glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0),  // black
    glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0),  // green
    glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0),  // red
    glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0),  // yellow
    glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0)   // white
];
var ds = 0.1;

window.onload = function init() {
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // load shaders and initialize attribute buffer
    var program = initShaders(gl, "rtvshader", "rtfshader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    sLoc = gl.getUniformLocation(program, "s");
    posLoc = gl.getUniformLocation(program, "pos");

    document.getElementById("choice").onchange = function (event) {
        var choice = parseInt(event.target.value);
        var x = document.getElementById("lineNum");
        switch (choice) {
            case 0:
                index = 0;//三角形
                x.style.display = "none";
                break;
            case 1:
                index = 1;//正方形
                x.style.display = "none";
                break;
            case 2:
                index = 2;// 立方体
                x.style.display = "none";
                break;
            case 3:
                index = 3;//圆
                x.style.display = "block";
                break;
            case 4:
                x.style.display = "none";
                break;
        }
    };
    document.getElementById("lineNum").onchange = function (event) {
        side = document.getElementById("lineNum").value;
    }
    // 获取颜色选择器颜色；
    document.getElementById("cl").onchange = function (event) {
        var c = 0;
        var ch = 0;
        var x = document.getElementById("cl").value;
        var Scolor = x.colorRgb();
        for (var i = 0; i < Scolor.length; i++) {
            if (parseInt(Scolor[i]) <= 9 && parseInt(Scolor[i]) >= 0) {
                c = 10 * c + parseInt(Scolor[i]);
            }
            else {
                color[ch++] = c;
                c = 0;
            }
            if (i == Scolor.length - 1) {
                color[ch++] = c;
                c = 0;
            }
        }
        color[3] = 1.0;
        document.getElementById("Demo").innerHTML += "<br>当前R：" + color[0] + ",G：" + color[1] + ",B：" + color[2] + "<br>";
        color[0] /= 255;
        color[1] /= 255;
        color[2] /= 255;
    }
    //绘制图形根据选择
    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var nowpos_x = event.clientX - rect.left;
        var nowpos_y = event.clientY - rect.top;
        var pos_x = 2 * nowpos_x / canvas.width - 1;
        var pos_y = 2 * (canvas.height - nowpos_y) / canvas.height - 1;
        document.getElementById("Demo").innerHTML = "当前x坐标：" + pos_x + "，当前y坐标：" + pos_y;//输出当前点位置
        if (index == 0) {
            triangleCr(pos_x, pos_y);
            document.getElementById("Demo").innerHTML += "<br>Triangle";
        } else if (index == 1) {
            squareCr(pos_x, pos_y);
            document.getElementById("Demo").innerHTML += "<br>Square";
        } else if (index == 2) {
            cubeCr(pos_x, pos_y);
            document.getElementById("Demo").innerHTML += "<br>Cube";
        } else if (index == 3) {
            circleCr(pos_x, pos_y);
            document.getElementById("Demo").innerHTML += "<br>Circle";
        } else if (index == 4) {
            document.getElementById("Demo").innerHTML += "<br>请选择图形";
        }
    });

    render();

}
function triangleCr(x, y) {
    points.push(x, y);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for (var i = 0; i < 3; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(glMatrix.vec4.fromValues(trianglePoints[i * 3], trianglePoints[i * 3 + 1], trianglePoints[i * 3 + 2], 1.0)))
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for (var i = 0; i < 3; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(color));
    }
    pointIndex += 3;
    graph.push(0);
};

function squareCr(x, y) {
    points.push(x, y);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for (var i = 0; i < 6; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(glMatrix.vec4.fromValues(squarePoints[i * 3], squarePoints[i * 3 + 1], squarePoints[i * 3 + 1], 1.0)));
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for (var i = 0; i < 6; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(color));
    }

    pointIndex += 6;
    graph.push(1);
}

function cubeCr(x, y) {
    points.push(x, y);
    var faces = [
        1, 0, 3, 1, 3, 2, //正
        2, 3, 7, 2, 7, 6, //右
        3, 0, 4, 3, 4, 7, //底
        6, 5, 1, 6, 1, 2, //顶
        4, 5, 6, 4, 6, 7, //背
        5, 4, 0, 5, 0, 1  //左
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for (var i = 0; i < faces.length; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(glMatrix.vec4.fromValues(vertices[faces[i]][0], vertices[faces[i]][1], vertices[faces[i]][2], 1.0)));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for (var i = 0; i < faces.length; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(vertexColors[Math.floor(i / 6)]));
    }
    pointIndex += 36;
    graph.push(2);

}

function circleCr(x, y) {
    points.push(x, y);
    var alpha = 2 * Math.PI / side;
    circlePoints.push(0.0, 0.0, 0.0);
    for (var i = 0; i <= side; i++) {
        circlePoints.push(0.2 * Math.cos(Math.PI - alpha * i), 0.2 * Math.sin(Math.PI - alpha * i), 0.0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for (var i = 0; i < circlePoints.length / 3; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(glMatrix.vec4.fromValues(circlePoints[i * 3], circlePoints[i * 3 + 1], circlePoints[i * 3 + 2], 1.0)));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for (var i = 0; i < circlePoints.length / 3; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), new Float32Array(color));
    }
    pointIndex += 100;
    graph.push(3);
}
function render() {
    var sindex = 0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < graph.length; i++) {
        if (graph[i] == 3) {
            translation += steps;
            if (translation > 0.1) steps *= -1;
            else if (translation < -0.1) steps *= -1;
            gl.uniform3fv(posLoc, [points[i * 2] + translation + Math.random(), points[i * 2 + 1] + translation + Math.random(), 0.0]);
        } else gl.uniform3fv(posLoc, [points[i * 2], points[i * 2 + 1], 0.0]);
        if (graph[i] == 0) {
            makeTriangle(sindex);
            sindex += 3;
        } else if (graph[i] == 1) {
            makeSquare(sindex);
            sindex += 6;
        } else if (graph[i] == 2) {
            makeCube(sindex);
            sindex += 36;
        } else if (graph[i] == 3) {
            makeCircle(sindex);
            sindex += 100;
        }
    }
    requestAnimFrame(render);
}

function makeTriangle(sindex) {
    s[0] = s[1] = s[2] += ds;
    if (s[0] < 0.5) ds *= -1;
    else if (s[0] > 2.0) ds *= -1
    gl.uniform3fv(sLoc, s);
    gl.uniform3fv(thetaLoc, [0.0, 0.0, 0.0]);
    gl.drawArrays(gl.TRIANGLES, sindex, 3);
}
function makeSquare(sindex) {
    thetaforSquare += 0.1;
    if (thetaforSquare > 2 * Math.PI) thetaforSquare -= (2 * Math.PI);
    gl.uniform3fv(sLoc, [1.0, 1.0, 1.0]);
    gl.uniform3fv(thetaLoc, [0.0, 0.0, thetaforSquare]);//按照z轴旋转
    gl.drawArrays(gl.TRIANGLES, sindex, 6);
}
function makeCube(sindex) {
    thetaforCube += 0.1;
    if (thetaforCube > 2 * Math.PI) thetaforCube -= 2 * Math.PI;
    gl.uniform3fv(sLoc, [1.0, 1.0, 1.0]);
    gl.uniform3fv(thetaLoc, [thetaforCube, 0.0, thetaforCube]);//按照某一轴旋转
    gl.drawArrays(gl.TRIANGLES, sindex, 36);
}
function makeCircle(sindex) {
    gl.uniform3fv(sLoc, [1.0, 1.0, 1.0]);
    gl.uniform3fv(thetaLoc, [0.0, 0.0, 0.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, sindex, sindex + side + 2);
}
// 转换16进制颜色为RGB颜色
var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
String.prototype.colorRgb = function () {
    var sColor = this.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange.join(",");
    } else {
        return sColor;
    }
}