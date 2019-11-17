import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import ControlsState from "controls-state";
import ControlsGui from "controls-gui";
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

const DEFAULT_POINTS = 20000;

const reglCreator = require("regl");

const App = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null);

  // In future, make reducer for all these points
  const [numPoints, setNumPoints] = useState(DEFAULT_POINTS);
  const [radius, setRadius ] = useState(2);
  const [regl, setRegl ] = useState(null);

  useEffect(() => {
    const onDone = (err, regl) => setRegl("foo"); // TODO: why calling setRegl on regl creates an error, I don't know. Use this workaround for now.
    reglRef.current = reglCreator({ container: canvasRef.current, onDone, attributes: { antialias: true }});
  }, []);

  // Wire up a GUI tester
  useEffect(() => {
    const state = ControlsState({
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
        setNumPoints(n);
      }
    });

    // // In future, pass in a reference to "run" directly instead.
    const gui = wrapGUI(state, {});
    document.body.appendChild(gui);
  }, [])

  return (
    <div className="App">
      {reglRef.current && (
        <Renderer
          regl={reglRef.current}
          numPoints={numPoints}
          radius={radius}
        ></Renderer>
      )}
      <div ref={canvasRef} className='reglWrapper'></div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
