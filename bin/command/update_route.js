/**
 * QuickWeb Command -update-struct
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../../');
var tool = quickweb.import('tool');
var path = require('path');
var fs = require('fs');
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-update-struct: %s', x); };
else
  debug = function() { };
 


/**
 * 生成文件目录结构
 *
 * @param {string} appdir 应用目录
 * @return {int}
 */
exports.run = function (appdir) {
  // 切换工作目录
  utils.chdir(appdir);
  
  var appdir = process.cwd();
  
  // 加载配置文件
  utils.log('Load app config...');
  var config = require(path.resolve(appdir, 'config.js'));
  
  // 读取html目录和code目录、tpl目录的文件结构
  utils.log('Scan app dir "' + appdir + '"...');
  var phtml = path.resolve('html');
  var pcode = path.resolve('code');
  var ptpl = path.resolve('tpl');
  var pmiddleware = path.resolve('middleware');
  
  var listdir = function (dir) {
    try {
      return tool.listdir(dir);
    }
    catch (err) {
      utils.log('Directory "' + dir + '" not found!');
      return {file: [], dir: []};
    }
  };
  
  var shtml = listdir(phtml);
  var scode = listdir(pcode, '.js');
  var stpl = listdir(ptpl);
  var smiddleware = listdir(pmiddleware);
  
  // 分析路径
  var ret = []
  // html目录
  utils.log('find ' + shtml.dir.length + ' dir(s)');
  for (var i in shtml.dir) {
    var p = tool.relativePath(phtml, shtml.dir[i]);
    ret.push('dir\t' + p);
  }
  // html文件
  utils.log('find ' + shtml.file.length + ' static file(s)');
  for (var i in shtml.file) {
    var p = tool.relativePath(phtml, shtml.file[i]);
    ret.push('file\t' + p);
  }
  // tpl目录
  utils.log('find ' + stpl.file.length + ' template file(s)');
  for (var i in stpl.file) {
    var p = tool.relativePath(ptpl, stpl.file[i]);
    ret.push('tpl\t' + p);
  }
  // middleware目录
  utils.log('find ' + smiddleware.file.length + ' middleware module(s)');
  for (var i in smiddleware.file) {
    var p = tool.relativePath(pmiddleware, smiddleware.file[i]);
    ret.push('middleware\t' + p);
  }
  // 程序
  utils.log('find ' + scode.file.length + ' code file(s)');
  for (var i in scode.file) {
    try {
      var m = tool.requireFile(scode.file[i], config.global);
      var p = tool.relativePath(pcode, scode.file[i]);
      ret.push('code\t' + p);
    }
    catch (err) {
      utils.log('Load code file ' + scode.file[i] + ' error: ' + err.stack);
    }
  }
  
  // 保存文件 route.txt
  utils.mkfile('route.txt', ret.join('\n'));
  
  // 运行结束
  utils.exit('OK.');
  
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('update route file on specified app directory.');
  L('analysis directory "html" and "code", create route table save on "route.txt"');
  L('');
  L('Examples:');
  L('  quickweb -update-route              update route table on current app path');
  L('  quickweb -update-route ./app/test1  update route table on path ./app/test1');
}
