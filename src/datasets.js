function phyllotaxis(n) {
  const theta = Math.PI * (3 - Math.sqrt(5));
  return function(i) {
    let r = Math.sqrt(i / n);
    let th = i * theta;
    return [r * Math.cos(th), r * Math.sin(th)];
  };
}

function grid(n) {
  const rowlen = Math.round(Math.sqrt(n));
  return i => [
    -0.8 + (1.6 / rowlen) * (i % rowlen),
    -0.8 + (1.6 / rowlen) * Math.floor(i / rowlen)
  ];
}

function sine(n) {
  let xscale = 2 / (n - 1);
  return function(i) {
    let x = -1 + i * xscale;
    return [x, Math.sin(x * Math.PI * 3) * 0.3];
  };
}

function spiral(n) {
  return function(i) {
    let t = Math.sqrt(i / (n - 1));
    return [t * Math.cos(t * Math.PI * 40), t * Math.sin(t * Math.PI * 40)];
  };
}

export { phyllotaxis, grid, sine, spiral };
