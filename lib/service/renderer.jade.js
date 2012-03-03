//@jsdev(qwdebug) debug

/**
 * QuickWeb Service renderer.jade
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var jade = require('jade');
var Service = require('../Service');
var tool = Service.import('tool');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /renderer/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Renderer.jade: %s', x); };
else
  debug = function() { };
  

var jadeConfig = {};

/**
 * 读取或设置默认配置
 *
 * @param {object} options
 */
exports.config = function (options) {
  if (typeof options === 'object') {
    jadeConfig = tool.merge(jadeConfig, options);
  }
  return jadeConfig;
}

/**
 * 渲染
 *
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @return {string}
 */
exports.render = function (text, data) {
  return exports.compile(text, jadeConfig)(data);
}

/**
 * 编译
 *
 * @param {string} text 模板内容
 * @return {function}
 */
exports.compile = function (text) {
  return jade.compile(text, jadeConfig);
}
