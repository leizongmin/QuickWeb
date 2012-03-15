//@jsdev(qwdebug) debug

/**
 * QuickWeb Service renderer.mustache
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path');
var mustache = require('mustache');
var Service = require('../Service');
var tool = Service.import('tool');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /renderer/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Renderer.mustache: %s', x); };
else
  debug = function() { };


var mustacheConfig = {};

/**
 * 读取或设置默认配置
 *
 * @param {object} options
 */
exports.config = function (options) {
  if (typeof options === 'object') {
    mustacheConfig = tool.merge(mustacheConfig, options);
  }
  return mustacheConfig;
}

/**
 * 渲染
 *
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @return {string}
 */
exports.render = function (text, data) {
  // Mustache模板不支持编译
  return mustache.to_html(text, data);
}

/**
 * 编译
 *
 * @param {string} text 模板内容
 * @return {function}
 */
exports.compile = function (text) {
  // Mustache模板不支持编译
  return function (data) {
    return mustache.to_html(text, data);
  }
}
