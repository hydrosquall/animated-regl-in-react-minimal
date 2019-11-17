// Organizing an existing regl program
// https://github.com/rreusser/smoothly-animating-points-with-regl
import { Component } from 'react';

import shaderFrag from "./shaderFrag.glsl";
import shaderVertex from "./shaderVertex.glsl";
const ease = require("eases/cubic-in-out");

const switchInterval = 2;
const switchDuration = 1;

// renderer = instance of Renderer
const getDrawPoints = (renderer) => {
  const { regl } = renderer;

  const drawPoints = regl({
    vert: shaderVertex,
    frag: shaderFrag,
    depth: { enable: false },
    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: (ctx, props) =>
        props.datasets[props.datasetPtr % props.datasets.length],
      xy1: (ctx, props) => props.datasets[(props.datasetPtr + 1) % props.datasets.length],
      basis: (ctx, props) => props.colorBasis
    },
    uniforms: {
      radius: (ctx, props) => props.pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp)) // clamp
    },
    primitive: "point",
    count: (ctx, props) => props.n
  });
  return drawPoints;
}

export class Renderer extends Component {
  constructor(props) {
    super(props);
    if (!props.regl) {
      throw Error("Easy there! REGL is not ready to use yet.");
    }
    this.regl = props.regl;
    this.initDrawFunctions();
    this._start();

    // Local state
    this.datasets = [];
    this.colorBasis = null;

    // Local state dealing with animation, not data.
    this.lastSwitchTime = 0;
    this.datasetPtr = 0;
  }

  // Might be able to remove this ini
  initDrawFunctions() {
    this.drawPoints = getDrawPoints(this);
  }

  // Main draw loop
  _draw = (time) => {
    if (!this.colorBasis) {
      return;
    }

    this.drawPoints({
      // external state
      pointRadius: this.props.radius,
      n: this.props.numPoints,
      datasets: this.props.datasets,
      colorBasis: this.props.colorBasis,
      // derived state
      datasetPtr: this.datasetPtr,
      interp: ease((time - this.lastSwitchTime) / switchDuration)
    });
  };

  _start() {
    const frameCallback = context => {
      const { time } = context;
      if (time - this.lastSwitchTime > switchInterval) {
        this.lastSwitchTime = time;
        this.datasetPtr++;
      }
      this._draw(time);
    };
    this.reglFrameLoop = this.regl.frame(frameCallback);
  }

  _stop() {
    if (this.reglFrameLoop) {
      this.reglFrameLoop.cancel();
    }
  }

  componentWillUnmount() {
    this._stop();
  }

  shouldComponentUpdate() {
    return false;
  }


  render() {
    return null;
  }
}
