/**
 * QuickWeb Service renderer
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Service: %s', x); };
else
  debug = function() { };
  
  
/**
 * 载入并配置指定的模板引擎
 *
 * @param {string} eng 模板引擎名称
 * @param {object} options 编译选项
 */
exports.config = function (eng, options) {
  var renderer = Service.import('renderer.' + eng);
  return renderer.config(options);
}
  
/**
 * 使用指定的模板引擎来渲染
 *
 * @param {string} eng 模板引擎名称
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @return {string}
 */
exports.render = function (eng, text, data) {
  return Service.import('renderer.' + eng).render(text, data);
}

/**
 * 使用指定模板引擎来编译
 *
 * @param {string} eng 模板引擎名称
 * @param {string} text 模板内容
 */
exports.compile = function (eng, text) {
  return Service.import('renderer.' + eng).compile(text);
}
