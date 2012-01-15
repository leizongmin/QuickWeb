/**
 * QuickWeb Service renderer.ejs
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
 
var debug;
if (process.env.QUICKWEB_DEBUG && /renderer/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Renderer.ejs: %s', x); };
else
  debug = function() { };
  
  
// 载入ejs模块
var ejs = require('ejs');

var ejsConfig = {};

/**
 * 读取或设置默认配置
 *
 * @param {object} options
 */
exports.config = function (options) {
  if (options) {
    for (var i in options)
      ejsConfig[i] = options[i];
  }
  return Object.freeze(ejsConfig);
}

/**
 * 渲染
 *
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @return {string}
 */
exports.render = function (text, data) {
  return exports.compile(text)(data);
}

/**
 * 编译
 *
 * @param {string} text 模板内容
 * @return {function}
 */
exports.compile = function (text) {
  return ejs.compile(text, ejsConfig);
}
