/**
 * QuickWeb Command -init-app
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
  debug = function(x) { console.error('-init-app: %s', x); };
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
  fs.mkdir(path.resolve(appdir, 'code'));
  fs.mkdir(path.resolve(appdir, 'html'));
  fs.mkdir(path.resolve(appdir, 'tpl'));
  
  // 创建配置文件
  var defaultconf = fs.readFileSync( path.resolve(__dirname
                                   , '__app_config.js'));
  fs.writeFileSync(path.resolve(appdir, 'config.js'), defaultconf);
  
  // 空白的路由信息文件
  fs.writeFileSync(path.resolve(appdir, 'route.txt'), '');
  
  console.log('ok.');
  return 1;
}
