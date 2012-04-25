/**
 * QuickWeb Command -unzip
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var Zip = require('adm-zip');
var child_process = require('child_process');
var quickweb = require('../../');
var cluster = quickweb.Cluster;
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-unzip: %s', x); };
else
  debug = function() { };
 


/**
 * 解压zip文件
 *
 * @param {string} filename 文件名
 * @param {string} target 目标目录
 * @return {int}
 */
exports.run = function (filename, target) {

  if (!filename)
    return utils.die('Please specified a zip file!');
  
  // 文件名绝对路径
  filename = path.resolve(filename);
  
  // 输出目录
  if (target) {
    var extpath = path.resolve(target);
  }
  else {
    var extname = path.extname(filename);
    var extpath = filename.substr(0, filename.length - extname.length);
  }
  utils.log('extract file "' + filename + '" to "' + extpath + '"...');
  
  return extractFile(filename, extpath);
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('extract a specified zip file.');
  L('');
  L('Examples:');
  L('  quickweb -unzip /file.zip    extract file "/file.zip" to "/file"');
}


/**
 * 使用adm-zip模块解压
 *
 * @param {string} filename 文件名
 * @param {string} extpath 目标路径
 */
var extractFile = function (filename, extpath) {
  try {
    var file = new Zip(filename);
    file.extractAllTo(extpath, true);
    utils.exit('OK.');
  }
  catch (err) {
    utils.die(err);
  }
}
