precision mediump float;
attribute vec2 xy0, xy1;
attribute float basis;
varying float t;
uniform float aspect, interp, radius;
void main () {
  t = basis;
  // Interpolate between the two positions:
  vec2 pos = mix(xy0, xy1, interp);
  gl_Position = vec4(pos.x, pos.y * aspect, 0, 1);
  gl_PointSize = radius;
}
