import React, { useEffect, useRef, useState, useReducer } from "react";
import ReactDOM from "react-dom";

import reglCreator from "regl";
import reglCamera from "regl-camera";

import { Renderer } from "./animation";
import { ControlPanel } from "./ControlPanel";
import { getReducer } from './reducer';

import "./styles.css";

const DEFAULT_POINTS = 20000;

const DEFAULT_STATE = {
  numPoints: DEFAULT_POINTS,
  datasets: [],
  colorBasis: null,
  reglInstance: null, // shared
  camera: null
};

const App = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null); // for some reason setState isn't good, maybe usecallback is better? this ref is ok for now.

  // In future, make reducer to store all of this state.
  const [radius, setRadius] = useState(4.5); // size per point
  const [state, dispatch] = useReducer(getReducer(reglRef.current), DEFAULT_STATE); // all this state is coupled.

  // The reason for putting the dom NEXT to the renderer instead of putting them together is so that the "update data"
  // method would get access to the "regl" buffer. However, I'm not sure if that's necessary... try to clean it up tomorrow.
  useEffect(() => {
    reglRef.current = reglCreator({
      container: canvasRef.current,
      attributes: { antialias: true },
      onDone: (err, regl) => {

        const camera = reglCamera(regl, {
          center: [0, 0, 0],
          theta: Math.PI / 2
        })

        dispatch({
          type: "setRegl",
          payload: { regl, camera }
        });
      }
    });
  }, []);

  return (
    <div className="App">
      {/*
          I think Regl needs to be instantiated above the renderer so that the dataloader can help
          with putting things into an REGL buffer. However, let's discuss this API with someone else first.
          I also think based on this experiment that we could consider moving the color scale into WEBGL if all the palettes were made into pragmas...
      */}
      {state.reglInstance && (
        <Renderer
          regl={state.reglInstance}
          camera={state.camera}
          numPoints={state.numPoints}
          radius={radius}
        ></Renderer>
      )}
      {/* Put this ref on the outside so we can control the ordering relative to the other control panels (underlay/overlay) */}
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
