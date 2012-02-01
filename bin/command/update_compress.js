/**
 * QuickWeb Command -update-gzip
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


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-update-compress: %s', x); };
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
  var shtml = tool.listdir(phtml);
  
  // 创建目录
  var gzipdir = path.resolve(appdir, 'html/.gzip');
  if (!path.exists(gzipdir))
    fs.mkdir(gzipdir);
  for (var i in shtml.dir) {
    var d = path.resolve(gzipdir, shtml.dir[i]);
    if (!path.exists(d))
      fs.mkdir(d);
  }
  
  // 去除.gzip目录下的文件
  var list = [];
  for (var i in shtml.file) {
    if (tool.relativePath(gzipdir, shtml.file[i]) === null)
      list.push(shtml.file[i]);
  }
  console.log('Find ' + list.length + ' file(s)');
  
  // 压缩文件
  var compressFile = function () {
    var f = list.pop();
    if (!f) {
      console.log('ok');
      process.exit();
    }
    else {
      console.log('Compress file ' + f);
      var filename = f.substr(phtml.length + 1);
      var basedir = path.dirname(path.resolve(gzipdir, filename));
      mkdirp(basedir, 777, function (err) {
        zlib.gzip(fs.readFileSync(f), function (err, data) {
          if (err)
            console.log('Error: ' + err.stack);
          else {
            var sf = path.resolve(gzipdir, filename);
            fs.writeFileSync(sf, data);
            console.log('Save as ' + sf);
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
