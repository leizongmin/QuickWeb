//@jsdev(qwdebug) debug

/**
 * QuickWeb Service template
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var fs = require('fs');
var Service = require('../Service');
var waitForQueue = Service.import('queue').wait;
 
var debug;
if (process.env.QUICKWEB_DEBUG && /template/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Template: %s', x); };
else
  debug = function() { };
  
  
  
/**
 * 预处理模板
 *
 * @param {string} text 模板内容
 * @param {object} conf 配置，必须指定filename:文件名 或者 dirname:目录名  quiet:是否显示标记
 * @return {string}
 */
exports.compile = function (text, conf) {
  if (typeof conf !== 'object') {
    conf = {dirname: process.cwd}
  }
  if (typeof conf.dirname !== 'string')
    conf.dirname = path.dirname(conf.filename);
  /*debug debug('compile file ' + conf.filename + ', path: ' + conf.dirname); */
    
  // 包含其他文件  <!-- #include "文件名" -->
  var ret = text.replace(/<!--\s*#include\s*['"][^\n\r'"]*['"]\s*\-->/gim, function (m) {
    var f = /['"].*['"]/.exec(m);
    if (f === null) {
      /*debug debug('ignore error tag: ' + m); */
      return m;
    }
      
    // 获取要载入的文件名
    f = f[0];
    f = f.substr(1, f.length - 2);
    var rf = path.resolve(conf.dirname, f);
    /*debug debug('include file ' + f + '(' + rf + ')'); */
    
    // 编译文件并返回
    var data = fs.readFileSync(rf, 'utf8');
    var text = exports.compile(data, {filename: rf});
    
    return text;
  });
  
  return ret;
}

/**
 * 预处理模板文件
 *
 * @param {string} filename 文件名
 * @param {object} conf 配置
 * @return {string}
 */
exports.compileFile = function (filename, conf) {
  if (typeof conf !== 'object')
    conf = {}
  conf.filename = filename;
  
  var text = fs.readFileSync(filename, 'utf8');
  
  return exports.compile(text, conf);
}

