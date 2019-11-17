import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";

import ControlsState from "controls-state";
import ControlsGui from "controls-gui";
import reglCreator from "regl";

import linspace from "ndarray-linspace";
import vectorFill from "ndarray-vector-fill";
import ndarray from "ndarray";

import { phyllotaxis, grid, sine, spiral } from "./datasets";
import { Renderer } from "./animation";

import "./styles.css";

const DEFAULT_POINTS = 20000;

// From RReusser ObservableHQ notebook
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
  );
  return root;
};

const App = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null); // for some reason setState isn't good, maybe usecallback is better? this ref is ok for now.

  // In future, make reducer to store all of this state.
  const [radius, setRadius ] = useState(2);
  const [datasetState, setState] = useState({ numPoints: DEFAULT_POINTS, datasets: [], colorBasis: undefined }); // all this state is coupled.

  // The reason for putting the dom NEXT to the renderer instead of putting them together is so that the "update data"
  // method would get access to the "regl" buffer. However, I'm not sure if that's necessary... try to clean it up tomorrow.
  const updateData = useCallback(
    (state, n, regl) => {
        // This pattern *either* creates a buffer or updates the existing buffer
        const datasets = [phyllotaxis, grid, sine, spiral].map((func, i) =>
          (state.datasets[i] || regl.buffer)(
            vectorFill(ndarray([], [n, 2]), func(n))
          )
        );
      // A list from 1 to 0 for coloring:
      const colorBasis = (state.colorBasis || regl.buffer)(
        linspace(ndarray([], [n]), 1, 0)
      );
      setState({
        datasets,
        colorBasis,
        numPoints: n
      });
    },
    []
  );

  useEffect(() => {
    reglRef.current = reglCreator({ container: canvasRef.current, attributes: { antialias: true }});
    // console.log(reglRef.current);
    // Render initial batch of data
    updateData(
      datasetState,
      datasetState.numPoints,
      reglRef.current
    );
  }, []);

  // Wire up a GUI tester
  // TODO: Split "controls" into a separate component so it can be independent of the main renderer app
  useEffect(() => {
    const controlState = ControlsState({
      instructions: ControlsState.Raw(h =>
        h(
          // PREACT
          "p",
          null,
          `POC of smoothly-animating-points-with-regl in create-react-app`
        )
      ),
      // name: "controls-state + controls-gui Prototype", // text input!
      // color: "#4499ff", // infers colors
      // "say hi": () => console.log("Hello!"), // can trigger actions!
      simulation: {
        // method: ControlsState.Select("RK2", {      // make an enum!
        //   options: ["Euler", "RK2", "RK4", "RK45"]
        // }),
        radius: ControlsState.Slider(1, { min: 1, max: 10, step: 0.25 }),
        n_points: ControlsState.Slider(DEFAULT_POINTS, {
          min: 1000,
          max: 200000,
          step: 1000
        })
        // running: false, // infers boolean
        // shape: { width: 640, height: 480 } // infers number toggles
      }
    }).$field.onChanges(data => {
      if (data["simulation.radius"]) {
        setRadius(data["simulation.radius"].value);
      }
      if (data["simulation.n_points"]) {
        const n = Math.round(data["simulation.n_points"].value);
        updateData(datasetState, n, reglRef.current);
      }
    });

    // // In future, pass in a reference to "run" directly instead.
    const gui = wrapGUI(controlState, {});
    document.body.appendChild(gui);
  }, [])

  return (
    <div className="App">
      {reglRef.current && (
        <Renderer
          regl={reglRef.current}
          numPoints={datasetState.numPoints}
          colorBasis={datasetState.colorBasis}
          datasets={datasetState.datasets}
          radius={radius}
        ></Renderer>
      )}
      <div ref={canvasRef} className='reglWrapper'></div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
