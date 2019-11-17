// Organizing an existing regl program
// https://github.com/rreusser/smoothly-animating-points-with-regl
import { Component } from 'react';

import linspace from "ndarray-linspace";
import vectorFill from "ndarray-vector-fill";
import ndarray from "ndarray";

import drawFunctions from "./datasets";

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

  initDrawFunctions() {
    this.drawPoints = getDrawPoints(this);
  }

  // Main draw loop
  _draw = (time) => {
    if (!this.colorBasis) {
      return;
    }

    // Camera provides "projection FOV matrix".
    this.props.camera(state => {
      this.drawPoints({
        // external state
        pointRadius: this.props.radius,
        n: this.props.numPoints,

        // Internal derived state
        datasets: this.datasets,
        colorBasis: this.colorBasis,
        datasetPtr: this.datasetPtr,
        // Vary on every iteration
        interp: ease((time - this.lastSwitchTime) / switchDuration) // TODO: convert division to multiplication for perf.
      });
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

  updateDatasets() {
    const n = this.props.numPoints;
    this.datasets = drawFunctions.map((func, i) =>
      (this.datasets[i] || this.regl.buffer)(
        vectorFill(ndarray([], [n, 2]), func(n))
      )
    );
    // A list from 1 to 0 for coloring:
    this.colorBasis = (this.colorBasis || this.regl.buffer)(
      linspace(ndarray([], [n]), 1, 0)
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.numPoints !== this.props.numPoints) {
      this.updateDatasets();
    }
  }

  componentDidMount() {
    this.updateDatasets();
  }

  render() {
    return null;
  }
}
