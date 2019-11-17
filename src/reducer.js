

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
          numPoints: n
        };
      case "setDatasetsAndColorBasis":
        // BUFFERS need to be same copies every time:
        const { colorBasis, datasets } = action.payload; // n = number of points, regl is a regl instance
        if (state.colorBasis) {
          return state;
        }
        return {
          ...state,
          colorBasis,
          datasets
        };
      case "setReglInstance":
        return {
          ...state,
          reglInstance: action.payload.regl
        };

      default:
        throw new Error();
    }
  };
}
