import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import { run } from "./animation";

const regl = require("regl");

function App() {
  const containerRef = useRef(null);
  useEffect(() => {
    const onDone = require("fail-nicely")(run);
    regl({ onDone, container: containerRef.current });
  }, []);

  return <div className="App" ref={containerRef} />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
