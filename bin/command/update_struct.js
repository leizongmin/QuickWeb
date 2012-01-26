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
 * @return {bool}
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
  var ret = {}
  // html目录
  for (var i in shtml.dir) {
    var p = tool.relativePath(phtml, shtml.dir[i]);
    ret[p] = { type:    'dir'     // 类型
             , file:    p         // 实际文件名
             }
  }
  // html文件
  for (var i in shtml.file) {
    var p = tool.relativePath(phtml, shtml.file[i]);
    ret[p] = { type:    'file'    // 类型
             , file:    p         // 实际文件名
             }
  }
  // 程序
  for (var i in scode.file) {
    try {
      var m = require(scode.file[i]);
      var p = tool.relativePath(pcode, scode.file[i]);
      p = p.substr(0, p.length - 3) + '.do';
      ret[p] = { type:    'code'   // 类型
               , file:    p        // 实际文件名
               }
    }
    catch (err) {
      console.log('Load code file ' + scode.file[i] + ' error: ' + err.stack);
    }
  }
  
  // 保存文件
  var sfn = path.resolve(appdir, 'struct.json');
  fs.writeFileSync(sfn, JSON.stringify(ret));
  console.log('Update file ' + sfn + ' success.');
  return true;
}
