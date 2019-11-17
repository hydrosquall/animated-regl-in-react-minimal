import React, { createRef, useEffect, memo } from 'react';

import ControlsState from "controls-state";
import ControlsGui from "controls-gui";

// From RReusser ObservableHQ notebook
function wrapGUI(state, opts) {
  const root = document.createElement("div");
  const gui = ControlsGui(
    state,
    Object.assign(
      {
        root: root,
        containerCSS: "max-width:400px;padding:30px 0;",
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

export const ControlPanel = memo((props) => {
  const wrapperRef = createRef(null);

  const { setRadius, dispatch } = props;
  useEffect(() => {
    const controlState = ControlsState({
      instructions: ControlsState.Raw(h =>
        h(
          // PREACT
          "p",
          null,
          `POC of smoothly-animating-points-with-regl in create-react-app, with regl-camera (pan and zoom)`
        )
      ),
      // name: "controls-state + controls-gui Prototype", // text input!
      // color: "#4499ff", // infers colors
      // "say hi": () => console.log("Hello!"), // can trigger actions!
      simulation: {
        // method: ControlsState.Select("RK2", {      // make an enum!
        //   options: ["Euler", "RK2", "RK4", "RK45"]
        // }),
        radius: ControlsState.Slider(4.5, { min: 1, max: 40, step: 0.25 }),
        n_points: ControlsState.Slider(20000, {
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
        dispatch({
          type: "setNumPoints",
          payload: { n }
        });
      }
    });

    // In future, don't do this appendchild trick workaround. However, it's OK for a proof of concept.
    const gui = wrapGUI(controlState, {});
    if (wrapperRef.current) {
      wrapperRef.current.appendChild(gui);
    }
  // Leaving out wrapperRef to avoid repeat control panel rendering issues.
  }, [setRadius, dispatch]); // shouldn't change because these come from hooks, but just in case

  return (<div ref={wrapperRef}></div> );
})

export default ControlPanel;
