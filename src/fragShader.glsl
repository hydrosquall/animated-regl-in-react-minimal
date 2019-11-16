precision mediump float;

varying float t;

// https://thebookofshaders.com/06/
vec3 colorA = vec3(0.149,0.141,0.912);
vec3 colorB = vec3(0.000,0.833,0.224);

void main () {
  float pct = abs(sin(t));
  vec3 color = mix(colorA, colorB, pct);
  //gl_FragColor = colormap(t);
  gl_FragColor = vec4(color, 1.0);
}
