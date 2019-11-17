import React, { useEffect, useRef, useState, useReducer } from "react";
import ReactDOM from "react-dom";

import reglCreator from "regl";

import { Renderer } from "./animation";
import { ControlPanel } from "./ControlPanel";
import { DataManager } from "./DataManager";
import { getReducer } from './reducer';

import "./styles.css";

const DEFAULT_POINTS = 20000;

const DEFAULT_STATE = {
  numPoints: DEFAULT_POINTS,
  datasets: [],
  colorBasis: undefined,
  reglInstance: null // shared
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
      attributes: { antialias: true },
      onDone: (err, regl) => {
        dispatch({
          type: "setReglInstance",
          payload: { regl }
        });
      }
    });
  }, []);

  return (
    <div className="App">
      {state.reglInstance && (
        <>
          <Renderer
            regl={state.reglInstance}
            numPoints={state.numPoints}
            colorBasis={state.colorBasis}
            datasets={state.datasets}
            radius={radius}
          ></Renderer>
          <DataManager
            dispatch={dispatch} // Keep this generic for now, but if narrowed in the future, limit to 1 callback per slider.
            numPoints={state.numPoints}
            regl={state.reglInstance}
            datasets={state.datasets}
            colorBasis={state.colorBasis}
          ></DataManager>
        </>
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
