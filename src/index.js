import React, { useEffect, useRef, useState, useReducer } from "react";
import ReactDOM from "react-dom";

import reglCreator from "regl";

import linspace from "ndarray-linspace";
import vectorFill from "ndarray-vector-fill";
import ndarray from "ndarray";

import { phyllotaxis, grid, sine, spiral } from "./datasets";
import { Renderer } from "./animation";
import { ControlPanel } from "./ControlPanel";

import "./styles.css";

const DEFAULT_POINTS = 20000;


// Reducer needs access to REGL insttance to be able to load data into a buffer, without the caller needing to know about REGL.
// Otherwise data processing logic will leak
function getReducer(regl) {
  return function reducer(state, action) {
    switch (action.type) {
      case "setNumPoints":
        const { n } = action.payload; // n = number of points, regl is a regl instance
        const datasets = [phyllotaxis, grid, sine, spiral].map((func, i) =>
          (state.datasets[i] || regl.buffer)(
            vectorFill(ndarray([], [n, 2]), func(n))
          )
        );
        // A list from 1 to 0 for coloring:
        const colorBasis = (state.colorBasis || regl.buffer)(
          linspace(ndarray([], [n]), 1, 0)
        );
        return {
          datasets,
          colorBasis,
          numPoints: n
        };
      default:
        throw new Error();
    }
  }
}


const DEFAULT_STATE = {
  numPoints: DEFAULT_POINTS,
  datasets: [],
  colorBasis: undefined
};

const App = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null); // for some reason setState isn't good, maybe usecallback is better? this ref is ok for now.

  // In future, make reducer to store all of this state.
  const [radius, setRadius] = useState(2); // size per point
  const [state, dispatch] = useReducer(getReducer(reglRef.current), DEFAULT_STATE); // all this state is coupled.

  // The reason for putting the dom NEXT to the renderer instead of putting them together is so that the "update data"
  // method would get access to the "regl" buffer. However, I'm not sure if that's necessary... try to clean it up tomorrow.
  useEffect(() => {
    reglRef.current = reglCreator({
      container: canvasRef.current,
      attributes: { antialias: true }
    });
    // Render initial batch of data
    dispatch({
      type: "setNumPoints",
      payload: { n: DEFAULT_POINTS }
    });
  }, []);

  return (
    <div className="App">
      {/*
          I think Regl needs to be instantiated above the renderer so that the dataloader can help
          with putting things into an REGL buffer. However, let's discuss this API with someone else first.
          I also think based on this experiment that we could consider moving the color scale into WEBGL if all the palettes were made into pragmas...
      */}
      {reglRef.current && (
        <Renderer
          regl={reglRef.current}
          numPoints={state.numPoints}
          colorBasis={state.colorBasis}
          datasets={state.datasets}
          radius={radius}
        ></Renderer>
      )}
      <div ref={canvasRef} className="reglWrapper"></div>
      <ControlPanel
        dispatch={dispatch} // Keep this generic for now, but if narrowed in the future, limit to 1 callback per slider.
        setRadius={setRadius}
      ></ControlPanel>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
