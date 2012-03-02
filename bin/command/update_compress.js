/**
 * QuickWeb Command -update-compress
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../../');
var tool = quickweb.import('tool');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-update-compress: %s', x); };
else
  debug = function() { };
 

// 图片文件扩展名
var IMAGE_FILE = ['.gif', '.jpg', '.jpeg', '.png']; 
 

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
  utils.log('Scan app dir "' + appdir + '"...');
  
  // 读取html目录和code目录的文件结构
  var phtml = path.resolve(appdir, 'html');
  var shtml = tool.listdir(phtml);
  
  // 检查是否存在html目录
  if (!path.existsSync('html'))
    utils.die('Cannot find html dir!');
    
  // 创建目录gzip目录
  utils.mkdir('html/.gzip');
  var gzipdir = path.resolve('html/.gzip');
  
  // 去除.gzip目录下的文件
  var list = [];
  for (var i in shtml.file) {
    if (tool.relativePath(gzipdir, shtml.file[i]) === null)
      list.push(shtml.file[i]);
  }
  utils.log('Find ' + list.length + ' file(s)');
  
  // 压缩文件
  var compressFile = function () {
    var f = list.pop();
    // 如果列表已空，则退出程序
    if (!f) {
      utils.exit('OK.');
    }
    // 忽略图片文件
    else if (IMAGE_FILE.indexOf(path.extname(f)) !== -1) {
      utils.log('Ignore image file: ' + f);
      compressFile();
    }
    else {
      utils.log('Compress file "' + f + '"...');
      var filename = f.substr(phtml.length + 1);
      var basedir = path.dirname(path.resolve(gzipdir, filename));
      mkdirp(basedir, 777, function (err) {
        zlib.gzip(fs.readFileSync(f), function (err, data) {
          if (err)
            utils.log('Error: ' + err.stack);
          else {
            var sf = path.resolve(gzipdir, filename);
            fs.writeFileSync(sf, data);
            utils.log('Save as "' + sf + '"');
          }
          compressFile();
        });
      });
    }
  }
  // 开始
  compressFile();
  
  return 0;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('update static compress file on specified app directory.');
  L('scan html directory, the compress file save on html/.gzip directory');
  L('');
  L('Examples:');
  L('  quickweb -update-compress               update compress file on current');
  L('                                          app path');
  L('  quickweb -update-compress ./app/test1   update compress file on path');
  L('                                          ./app/test1');
}
