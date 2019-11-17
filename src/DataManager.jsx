import React, { Component } from 'react';

import linspace from "ndarray-linspace";
import vectorFill from "ndarray-vector-fill";
import ndarray from "ndarray";

import { phyllotaxis, grid, sine, spiral } from "./datasets";


// Rewrite as functional component IFF it feels natural.
export class DataManager extends Component {

  componentDidUpdate(prevProps) {
    if (prevProps.numPoints !== this.props.numPoints) {
      const n = this.props.numPoints;

      // Set of all derived state... could be hoisted up into reselect.
      // note that this might mutate things in place...
      const datasets = [
        phyllotaxis,
        grid,
        sine,
        spiral
      ].map((func, i) => {
          const buffer = this.props.datasets[i] || this.props.regl.buffer; // use existing buffer, or get new one if doesn't exist.
          buffer(vectorFill(ndarray([], [n, 2]), func(n)));
        }
      );

      // A list from 1 to 0 for coloring:
      const colorBuffer = this.props.colorBasis || this.props.regl.buffer;
      const colorBasis = colorBuffer(linspace(ndarray([], [n]), 1, 0));

      this.props.dispatch({ type: 'setDatasetsAndColorBasis', payload: { datasets, colorBasis }});
    }
  }

  render() {
    return null;
  }
}
