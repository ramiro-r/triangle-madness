function setFragColor(gl, u_attrib, color) {
    const u_FragColor = gl.getUniformLocation(gl.program, u_attrib);
    if (!u_FragColor) {
        console.log('Fail to get u_FragColor');
        return 1;
    }

    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    return 0;
}

function setPointSize(gl, a_attrib, size) {
    const a_PointSize = gl.getAttribLocation(gl.program, a_attrib);
    if (a_PointSize < 0) {
        console.log('Fail to get attribute point size');
        return 1;
    }
    gl.vertexAttrib1f(a_PointSize, size);
    return 0;
}