/**
 * QuickWeb Quick load code dir
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../');
var fs = require('fs');
var path = require('path');
var tool = quickweb.import('tool');

var debug;
if (process.env.QUICKWEB_DEBUG && /quick/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Load code file: %s', x); };
else
  debug = function() { };
  
  
/**
 * 扫描指定目录，并自动注册路由
 *
 * @param {string} dir 目录
 * @param {object} routes 路由对象，包括 get, post, head, put, delete, options
 * @param {object} conf 配置
 */
exports.loaddir = function (dir, routes, conf) {
  // 读取目录下所有.js文件
  dir = path.resolve(dir);
  var files = tool.listdir(dir, '.js');
 
 // 逐个载入文件
  for (var i in files) {
    var f = files[i];
    var m = require(f);
    var p = tool.relativePath(dir, f);
    p = p.substr(0, p.length - 3) + '.nsp';

    // 注册路由
    for (var j in routes) {
      var r = routes[j];
      if (typeof m[j] == 'function') {
        r.add(p, m[j]);
        // 如果输出了path属性，则同时注册该path
        if (m.path)
          r.add(m.path, m[j]);
      }
    }
  }
}

