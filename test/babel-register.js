require("@babel/register")({
  presets: [["@babel/preset-env", { targets: { node: "current" }, modules: "commonjs" }]],
  ignore: [/node_modules/],
});
