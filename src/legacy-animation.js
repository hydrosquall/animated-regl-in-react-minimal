// imperative style...
// Fixed REGL context to persist over lifetime...
export function run(regl) {
  let datasets = [];
  let colorBasis;
  let datasetPtr = 0;

  let pointRadius = 3;
  let lastSwitchTime = 0;

  const createDatasets = n => {
    // This is a cute little pattern that *either* creates a buffer or updates
    // the existing buffer since both the constructor and the current instance
    // can be called as a function.
    datasets = [phyllotaxis, grid, sine, spiral].map((func, i) =>
      (datasets[i] || regl.buffer)(vectorFill(ndarray([], [n, 2]), func(n)))
    );
    // This is just a list from 1 to 0 for coloring:
    colorBasis = (colorBasis || regl.buffer)(linspace(ndarray([], [n]), 1, 0));
  };

  // Initialize:
  regl.n = DEFAULT_POINTS; // TODO: what's the proper way to shuffle state between handlers and REGL? Seems like we'd want to hoist this out to props.
  regl.pointRadius = pointRadius; // TODO: what's the proper way to shuffle state between handlers and REGL? Seems like we'd want to hoist this out to props.
  createDatasets(regl.n); // default

  const drawPoints = regl({
    vert: shaderVertex,
    frag: shaderFrag,
    depth: { enable: false },
    // Constants
    uniforms: {
      radius: () => regl.pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp)) // alpha
    },
    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length], // before and after position... stride for each
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],
      basis: () => colorBasis
    },
    primitive: "point",
    count: () => regl.n
  });

  regl.frame(context => {
    const { time } = context;

    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if (time - lastSwitchTime > switchInterval) {
      lastSwitchTime = time;
      datasetPtr++;
    }
    drawPoints({ interp: ease((time - lastSwitchTime) / switchDuration) });
  });

  console.log("Completed setup");
}
