const VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
        'gl_Position = a_Position;\n' +
        'gl_PointSize = a_PointSize;\n' +
    '}\n';

const FSHADER_SOURCE = 
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
        'gl_FragColor = u_FragColor;' +
    '}\n';

let appBootstrapped = false;
let isDrawing = false;
let triangles = [];
let interval, trackTimeout;
let audio, canvas, tapIndicator, replayBtn;
let gl;
const LIMIT = 200;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function main() {
    canvas = document.getElementById('webgl');
    tapIndicator = document.getElementById('tap_indicator');
    audio = document.getElementById('track');
    replayBtn = document.getElementById('replayBtn');

    if (!canvas) {
        console.log('not able to find canvas element');
        return;
    }

    setCanvasFullWidth(canvas);

    const content = document.querySelector('.content');
    content.addEventListener('click', toggleDrawing);
    replayBtn.addEventListener('click', toggleDrawing);
    window.addEventListener('resize', setCanvasFullWidth);

    gl = getWebGLContext(canvas);
    
    if (!gl) {
        console.log('not able to retrieve WebGL context');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Error initializing shaders');
        return;
    }

    // set background to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function handleTrackEnded() {
    pauseAudio()
    stopDrawing();
    toggleFooter(true);
}

function toggleDrawing() {
    if (isDrawing) {
        pauseAudio();
        stopDrawing();
        toggleFooter(true);
        return;
    }
    toggleFooter(false);
    toggleTapIndicator(false);
    trackTimeout = setTimeout(handleTrackEnded, Math.floor(audio.duration) * 1000);
    audio.play();
    isDrawing = true;
    interval = setInterval(() => generateTriangle(), 545);
}

function pauseAudio() {
    audio.pause();
    audio.currentTime = 0;
    if (trackTimeout) {
        clearTimeout(trackTimeout);
        trackTimeout = null;
    }
}

function stopDrawing() {
    isDrawing = false;
    triangles = [];
    clearInterval(interval);
}

function toggleFooter(visible) {
    const footer = document.querySelector('footer');
    footer.style.opacity = visible ? 1 : 0;
}

function toggleTapIndicator(visible) {
    tapIndicator.style = visible ? "display: block" : "display: none";
}

function generateTriangle() {
    if (isSafari && triangles.length > LIMIT) {
        handleTrackEnded();
        return;
    }

    const triangle = {
        vertices: [
            Math.random() * plusOrMinus(), Math.random() * plusOrMinus(), 
            Math.random() * plusOrMinus(), Math.random() * plusOrMinus(), 
            Math.random() * plusOrMinus(), Math.random() * plusOrMinus()
        ],
        color: [Math.random(), Math.random(), Math.random(), (Math.random() + 0.3)]
    }

    triangles.push(triangle);
    drawTriangleList(triangles);
}

function drawTriangleList(triangles) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangles.forEach(triangle => {
        drawTriangle(triangle.vertices, triangle.color)
    });
}

function drawTriangle(vertices, color) {
    const setColorErr = setFragColor(gl, 'u_FragColor', color);
    if (setColorErr) {
        console.log('Error setting point color');
    }

    const n = initVertexBuffers(gl, vertices);
    if (n < 0) {
        console.log('Fail to init the buffers');
        return;
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function plusOrMinus() {
    return Math.random() < 0.5 ? -1 : 1;
}

function setCanvasFullWidth() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initVertexBuffers(gl, coordinates) {
    const vertices = new Float32Array(coordinates);
    const n = coordinates.length / 2;

    // 1 - create a buffer object
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Fail to create buffer');
        return -1;
    }

    // 2 - bind buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 3 - write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 4 - assign the buffer object to a_Position variable
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Fail to get attribute position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 5 - enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}
