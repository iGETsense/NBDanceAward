"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/isomorphic-fetch";
exports.ids = ["vendor-chunks/isomorphic-fetch"];
exports.modules = {

/***/ "(rsc)/./node_modules/isomorphic-fetch/fetch-npm-node.js":
/*!*********************************************************!*\
  !*** ./node_modules/isomorphic-fetch/fetch-npm-node.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar realFetch = __webpack_require__(/*! node-fetch */ \"(rsc)/./node_modules/node-fetch/lib/index.mjs\");\nmodule.exports = function(url, options) {\n\tif (/^\\/\\//.test(url)) {\n\t\turl = 'https:' + url;\n\t}\n\treturn realFetch.call(this, url, options);\n};\n\nif (!global.fetch) {\n\tglobal.fetch = module.exports;\n\tglobal.Response = realFetch.Response;\n\tglobal.Headers = realFetch.Headers;\n\tglobal.Request = realFetch.Request;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tbm9kZS5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYixnQkFBZ0IsbUJBQU8sQ0FBQyxpRUFBWTtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLW5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciByZWFsRmV0Y2ggPSByZXF1aXJlKCdub2RlLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgb3B0aW9ucykge1xuXHRpZiAoL15cXC9cXC8vLnRlc3QodXJsKSkge1xuXHRcdHVybCA9ICdodHRwczonICsgdXJsO1xuXHR9XG5cdHJldHVybiByZWFsRmV0Y2guY2FsbCh0aGlzLCB1cmwsIG9wdGlvbnMpO1xufTtcblxuaWYgKCFnbG9iYWwuZmV0Y2gpIHtcblx0Z2xvYmFsLmZldGNoID0gbW9kdWxlLmV4cG9ydHM7XG5cdGdsb2JhbC5SZXNwb25zZSA9IHJlYWxGZXRjaC5SZXNwb25zZTtcblx0Z2xvYmFsLkhlYWRlcnMgPSByZWFsRmV0Y2guSGVhZGVycztcblx0Z2xvYmFsLlJlcXVlc3QgPSByZWFsRmV0Y2guUmVxdWVzdDtcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/isomorphic-fetch/fetch-npm-node.js\n");

/***/ })

};
;