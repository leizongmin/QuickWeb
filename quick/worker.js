/**
 * QuickWeb Worker
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var http = require('http');
var quickweb = require('../');
var mq = require('./mq');


var debug;
if (process.env.QUICKWEB_DEBUG && /worker/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-worker: %s', x); };
else
  debug = function() { };
 
 
/**
 * 启动Worker进程
 *
 * @param {object} conf 配置
 */
module.exports = function (conf) {
  
}
