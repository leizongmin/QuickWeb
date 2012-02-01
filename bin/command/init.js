/**
 * QuickWeb Command -init
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
  debug = function(x) { console.error('-init: %s', x); };
else
  debug = function() { };
 


/**
 * 生成服务器目录结构
 *
 * @param {string} appdir 应用目录
 * @return {int}
 */
exports.run = function (appdir) {
  // 默认使用当前目录
  if (typeof appdir != 'string')
    appdir = process.cwd();
  if (!path.exists(appdir))
    fs.mkdir(appdir);
  
  // 创建目录
  fs.mkdir(path.resolve(appdir, 'app'));
  
  // 创建文件
  fs.writeFileSync(path.resolve(appdir, 'config.json'), JSON.stringify({}));
  
  console.log('ok.');
  return 1;
}
