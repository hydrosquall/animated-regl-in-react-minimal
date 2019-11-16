// Organizing an existing regl program
// https://github.com/rreusser/smoothly-animating-points-with-regl
import { phyllotaxis, grid, sine, spiral } from "./datasets";
import controlPanel from 'control-panel';
import fragShader from "./fragShader.glsl";

import ControlsState from 'controls-state';
import ControlsGui from 'controls-gui';

const linspace = require("ndarray-linspace");
const vectorFill = require("ndarray-vector-fill");
const ndarray = require("ndarray");
const ease = require("eases/cubic-in-out");

const switchInterval = 2;
const switchDuration = 1;

function wrapGUI(state, opts) {
  const root = document.createElement("div");
  const gui = ControlsGui(
    state,
    Object.assign(
      {
        root: root,
        containerCSS: "max-width:350px;padding:30px 0;",
        theme: Object.assign({}, (opts || {}).theme, {
          fontFamily: "'Helvetica', sans-serif",
          fontSize: "13px"
        })
      },
      opts || {}
    )
  ).$field.onChanges(e => root.dispatchEvent(new CustomEvent("input")));
  root.value = state;
  return root;
}

export function run(regl) {

  let datasets = [];
  let colorBasis;
  let datasetPtr = 0;

  let pointRadius = 3;
  let lastSwitchTime = 0;

  const createDatasets = (n) => {
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
  createDatasets(100000); // default
  regl.n = 100000;

  // Create nice controls:
  const state = ControlsState({
    instructions: ControlsState.Raw(h =>
      h(
        // PREACT
        "p",
        null,
        `POC to show running smoothly-animating-points-with-regl in CRA`
      )
    ),
    // name: "controls-state + controls-gui Prototype", // text input!
    // color: "#4499ff", // infers colors
    // "say hi": () => console.log("Hello!"), // can trigger actions!
    simulation: {
      // method: ControlsState.Select("RK2", {      // make an enum!
      //   options: ["Euler", "RK2", "RK4", "RK45"]
      // }),
      radius: ControlsState.Slider(10, { min: 1, max: 10, step: 0.25 }),
      n_points: ControlsState.Slider(50000, {
        min: 1000,
        max: 200000,
        step: 1000
      })
      // running: false, // infers boolean
      // shape: { width: 640, height: 480 } // infers number toggles
    }
  }).$field.onChanges(data => {
    if (data["simulation.radius"]) {
      pointRadius = data["simulation.radius"].value;
    }
    if (data["simulation.n_points"]) {
      const n = Math.round(data["simulation.n_points"].value);
      regl.n = n;
      createDatasets(n);
    }
  });

  // This is a bit hacky, in future work with a DOM ref.
  const gui = wrapGUI(state ,{});
  document.body.appendChild(gui);

  const drawPoints = regl({
    vert: `
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
    `,
    frag: fragShader,
    depth: { enable: false },
    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length],
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],
      basis: () => colorBasis
    },
    uniforms: {
      radius: () => pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp))
    },
    primitive: "point",
    count: () => regl.n
  });

  regl.frame(({ time }) => {
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
