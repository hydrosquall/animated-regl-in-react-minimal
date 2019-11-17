
import linspace from "ndarray-linspace";
import vectorFill from "ndarray-vector-fill";
import ndarray from "ndarray";

import { phyllotaxis, grid, sine, spiral } from "./datasets";

// Reducer needs access to REGL insttance to be able to load data into a buffer, without the caller needing to know about REGL.
// Otherwise data processing logic will leak into the renderer.
// Alternately, we can store the regl instance in redux!
export function getReducer(regl) {
  return function reducer(state, action) {
    switch (action.type) {
      case "setNumPoints":
        const { n } = action.payload; // n = number of points, regl is a regl instance

        return {
          ...state,
          // datasets,
          // colorBasis,
          numPoints: n
        };
      case "setRegl":
        return {
          ...state,
          regl: action.payload.regl
        }

      default:
        throw new Error();
    }
  };
}
