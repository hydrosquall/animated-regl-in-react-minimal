// Reducer needs access to REGL instance to be able to load data into a buffer, without the caller needing to know about REGL.
// Otherwise data processing logic will leak into the renderer.
// Alternately, we can store the regl instance in redux!
export function getReducer(regl) {
  return function reducer(state, action) {
    switch (action.type) {
      case "setNumPoints":
        const { n } = action.payload; // n = number of points, regl is a regl instance

        return {
          ...state,
          numPoints: n
        };
      case "setRegl":
        return {
          ...state,
          reglInstance: action.payload.regl,
          camera: action.payload.camera
        }

      default:
        throw new Error();
    }
  };
}
