const {override, removeInternalBabelPlugin, addBabelPlugin} = require('customize-cra')
const path = require('path')
module.exports = override(
  // addBabelPlugin('babel-plugin-transform-remove-console'),
  removeInternalBabelPlugin("@babel/plugin-transform-function-name"),
)