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
  // 默认使用当前目录
  if (typeof appdir != 'string')
    appdir = process.cwd();
  console.log('Scan dir ' + appdir);
  
  // 读取html目录和code目录的文件结构
  var phtml = path.resolve(appdir, 'html');
  var pcode = path.resolve(appdir, 'code');
  var shtml = tool.listdir(phtml);
  var scode = tool.listdir(pcode, '.js');
  
  // 分析路径
  var ret = []
  // html目录
  console.log('find ' + shtml.dir.length + ' dir(s)');
  for (var i in shtml.dir) {
    var p = tool.relativePath(phtml, shtml.dir[i]);
    ret.push('dir\t' + p);
  }
  // html文件
  console.log('find ' + shtml.file.length + ' static file(s)');
  for (var i in shtml.file) {
    var p = tool.relativePath(phtml, shtml.file[i]);
    ret.push('file\t' + p);
  }
  // 程序
  console.log('find ' + scode.file.length + ' code file(s)');
  for (var i in scode.file) {
    try {
      var m = require(scode.file[i]);
      var p = tool.relativePath(pcode, scode.file[i]);
      ret.push('code\t' + p);
    }
    catch (err) {
      console.log('Load code file ' + scode.file[i] + ' error: ' + err.stack);
    }
  }
  
  // 保存文件
  var sfn = path.resolve(appdir, 'route.txt');
  fs.writeFileSync(sfn, ret.join('\n'));
  console.log('Update file ' + sfn + ' success.');
  console.log('ok.');
  
  return 1;
}
