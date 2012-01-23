/**
 * QuickWeb Service cookie
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /tool/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Tool: %s', x); };
else
  debug = function() { };
  
  
/**
 * 32位MD5加密
 *
 * @param {string} text 文本
 * @return {string}
 */
exports.md5 = function (text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * 列出目录下（包括子目录）所有指定类型的文件
 *
 * @param {string} dir 目录
 * @param {string} extname 后缀
 * @return {object} 相对路径， file:文件, dir:目录
 */
exports.listdir = function (dir, extname) {
  // 读取当前目录下的所有文件名
  var dirs = fs.readdirSync(dir);
  var extlen = extname ? extname.length : 0;
  var ret = {file: [], dir: []};
  // 逐个判断，如果是目录，则继续深度搜索
  for (var i in dirs) {
    try {
      var d = dirs[i];
      // 忽略.和..
      if (d === '.' || d === '..')
        continue;
      // 取文件属性
      var tp = path.resolve(dir, d);
      var s = fs.statSync(tp);
      if (!s)
        continue;
      // 是文件
      if (s.isFile()) {
        if (!extname)
          ret.file.push(tp);
        else if (extname && (tp.substr(0 - extlen) == extname))
          ret.file.push(tp);
      }
      // 是目录
      else if (s.isDirectory()) {
        ret.dir.push(tp);
        var r = exports.listdir(tp, extname);
        for (var j in r.file)
          ret.file.push(path.resolve(tp, r.file[j]));
        for (var j in r.dir)
          ret.dir.push(path.resolve(tp, r.dir[j]));
      }
    }
    catch (err) {
      debug(err.stack);
    }
  }
  return ret;
}

/**
 * 取相对文件名
 *
 * @param {string} base 基本路径
 * @param {string} pathname 路径
 * @return {string}
 */
exports.relativePath = function (base, pathname) {
  base = base.replace(/\\/ig, '/');
  pathname = pathname.replace(/\\/ig, '/');
  if (base.charAt(base.length - 1) != '/')
    base += '/';
  if (pathname.substr(0, base.length) != base)
    return null;
  else
    return pathname.substr(base.length);
}

