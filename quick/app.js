/**
 * QuickWeb App
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var http = require('http');
var quickweb = require('../');


var debug;
if (process.env.QUICKWEB_DEBUG && /app/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('app: %s', x); };
else
  debug = function() { };
 
 
/**
 * 加载指定目录下的应用
 *
 * @param {string} appdir 应用目录
 */
exports.load = function (appdir) {

}
