
const { edit, getPaths } = require("@rescripts/utilities");

const predicate = valueToTest => {
  return valueToTest.oneOf;
};



// In future, deal with case where rules happens more than once.
// this works ONLY if the "ONEOF key" isn't intercepting your file in the CRA config
// const transform = match => ({
//   ...match,
//   rules: [
//     ...match.rules,
//     {
//       test: /\.(glsl|frag|vert)$/,
//       exclude: [/node_modules/],
//       use: ["raw-loader", "glslify-loader"]
//     }
//   ]
// });

// // Rewrite with immer produce or lodash set for nested update?
const transform = match => ({
  ...match,
  oneOf: [
    // Need to add as second-to-last to avoid being intercepted by the file-loader in CRA
    ...match.oneOf.slice(0, -1),
    {
      test: /\.(glsl|frag|vert)$/,
      exclude: [/node_modules/],
      use: ["raw-loader", "glslify-loader"]
    },
    ...match.oneOf.slice(-1)
  ]
});

// Review base
// https://github.com/facebook/create-react-app/blob/58b4738a490f9643f540e9fdb74431c4d73e3ad7/packages/react-scripts/config/webpack.config.js#L384-L386
// Based on https://github.com/linonetwo/rescript-service-worker-loader/blob/master/src/index.js
// TODO: Rewrite with data pipeline (ramda) if this gets complicated
function rescriptGlslifyPlugin() {
  return config => {
    const matchingPaths = getPaths(predicate, config);
    const newConfig = edit(transform, matchingPaths, config);
    return newConfig;

  };
}

module.exports = [
  [
    rescriptGlslifyPlugin,
  ],
]
