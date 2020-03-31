const replace = require('../extern/replace-method');

// Webpack debundling shim
// Here's what a webpack bundle looks like:
//
// (function(modules) {
//   // webpack require shim is here
// })([
//   function(module, exports, __webpack_require__) {
//     var foo = __webpack_require__(2); // The index of the item to pull in within the array
//   },
//   function(module, exports, __webpack_require__) {
//     "I am foo!";
//   }
// ])
function webpackDecoder(moduleArrayAST, knownPaths, needComments, wholeAST) {
  // Ensure that the bit of AST being passed is an array
  if (moduleArrayAST.type !== 'ArrayExpression') {
    throw new Error(`The root level IIFE didn't have an array for it's first parameter, aborting...`);
  }

  return moduleArrayAST.elements.map((moduleDescriptor, id) => {
    // merge comments to each module
    if (needComments) {
      let moduleStart = moduleDescriptor.range[0];
      let moduleEnd = moduleDescriptor.range[1];
      moduleDescriptor.comments = [];
      moduleDescriptor.tokens = wholeAST.tokens;
      wholeAST.comments.map((comment) => {
        let commentStart = comment.range[0];
        let commentEnd = comment.range[1];
        if (commentStart >= moduleStart && commentEnd <= moduleEnd) {
          moduleDescriptor.comments.push(comment);
        }
      });
    }

    return {
      id,
      code: moduleDescriptor,
    };
  }).filter(i => i.code);
}

function getModuleFileName(node, knownPaths) {
  let id = node.arguments[0].raw;
  return knownPaths[id] ? knownPaths[id] : `./${id}`;
}

module.exports = webpackDecoder;
