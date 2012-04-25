//@jsdev(qwdebug) debug

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
var cp = require('child_process');
var vm = require('vm');
var Module = require('module');
 
var debug;
var isDebug;
if (process.env.QUICKWEB_DEBUG && /tool/.test(process.env.QUICKWEB_DEBUG)) {
  debug = function(x) { console.error('Tool: %s', x); };
  isDebug = true;
}
else {
  debug = function() { };
  isDebug = false;
}
  
  
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
      /*debug debug(err.stack); */
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

/**
 * 载入程序文件，并删除其缓存
 *
 * @param {string} filename 文件名
 * @param {object} context 环境变量
 * @param {object} parent 父模块
 * @return {object}
 */
exports.requireFile = function (filename, context, parent) {
  var self = this;
  filename = path.resolve(filename);
  
  // 如果没有指定环境变量和父模块，则清除缓存模块并加载
  if (!context && !parent) {
    /*debug debug('require no cache file: ' + filename); */
    
    delete require.cache[filename];
    var m = require(filename);
    delete require.cache[filename];
    
    return m;
  }
  // 否则，使用指定的环境变量和父模块来载入文件
  else {
    /*debug debug('require specified context file: ' + filename); */
    
    if (typeof context !== 'object')
      context = {}
    
    // 复制全局变量
    var sandbox = exports.merge(global, context);
    
    return exports.requireWithContext(filename, sandbox, parent);
  }
}

/**
 * 使用指定的沙箱环境来载入模块文件
 *
 * @param {string} filename 文件名
 * @param {object} sandbox 沙箱
 * @param {object} parent 父对象
 * @return {object}
 */
exports.requireWithContext = function (filename, sandbox, parent) {
  try {
    if (!parent)
      parent = {require: require}
    if (!sandbox)
      sandbox = {}
    
    // 读取代码
    var code = fs.readFileSync(filename, 'utf8');
    
    // 模拟require()环境
    sandbox.module = new Module(filename, parent);
    sandbox.exports = sandbox.module.exports;
    sandbox.__dirname = path.dirname(filename);
    sandbox.__filename = filename;
    sandbox.module.filename = filename;
    sandbox.module.paths = Module._nodeModulePaths(sandbox.__dirname);
    sandbox.global = sandbox;
    sandbox.root = root;
    sandbox.require = function (path) {
      var f = sandbox.require.resolve(path);
      return parent.require(f);
    }
    sandbox.require.resolve = function(request) {
      return Module._resolveFilename(request, sandbox.module);
    }
    sandbox.require.main = process.mainModule;
    sandbox.require.extensions = Module._extensions;
    sandbox.require.cache = Module._cache;
    
    // 运行代码
    vm.runInNewContext(code, sandbox, filename);
      
    // 返回模块输出
    return sandbox.module.exports;
  }
  catch (err) {
    // 如果是语法错误，则尝试输出更详细的信息，不如出错的位置
    if (exports.isSyntaxError(err)) {
      process.stdout.write('--------------------------------------------------------------------------------\n');
      process.stdout.write(err.toString() + '\n');
      try {
        require(filename);
      }
      catch (e) { }
      process.stdout.write('--------------------------------------------------------------------------------\n');
    }
    throw new Error(err.toString() + '\n    at ' + filename);
  }
}

/**
 * 组装多个Buffer对象
 *
 * @return {BufferArray}
 */
exports.bufferArray = function () {
  return new BufferArray();
}

/**
 * BufferArray
 */
var BufferArray = function () {
  this.array = [];
  this.length = 0;
}
/**
 * 添加
 *
 * @param {Buffer|string} buff
 */
BufferArray.prototype.add = function (buff) {
  if (!Buffer.isBuffer(buff)) {
    if (typeof buff === 'string')
      buff = new Buffer(buff.toString());
    else
      return false;
  }
    
  this.array.push(buff);      // Buffer数组
  this.length += buff.length; // 总长度
  delete this._cache;         // 删除缓存
  return true;
}
BufferArray.prototype.push = BufferArray.prototype.add;

/**
 * 组装
 *
 * @return {Buffer}
 */
BufferArray.prototype.toBuffer = function () {
  if (Buffer.isBuffer(this._cache))
    return this._cache;
  else {
    var ret = new Buffer(this.length);
    var offset = 0;
    for (var i in this.array) {
      this.array[i].copy(ret, offset, 0);
      offset += this.array[i].length;
    }
    this._cache = ret;
    return ret;
  }
}
/**
 * 组装并返回字符串
 *
 * @return {string}
 */
BufferArray.prototype.toString = function () {
  return this.toBuffer().toString();
}

/**
 * 执行QuickWeb命令
 *
 * @param {array} args 参数
 * @param {object} opt 选项
 * @param {function} callback 回调, 包含 err, stdout, stderr
 */
exports.quickwebCmd = function (args, opt, callback) {
  if (typeof opt === 'function') {
    callback = opt;
    opt = { env: process.env, timeout: 60000}
  }
  
  // bin/quickweb.js文件所在位置
  var quickweb_js = path.resolve(__dirname, '../../bin/quickweb.js');
  
  args.unshift(quickweb_js);
  if (isDebug) {
    opt.timeout = 0;
    args.unshift('--debug-brk');
  }
  args.unshift(process.execPath);
  /*debug debug('exec: ' + args.join(' ')); */
  
  try {
    cp.exec(args.join(' '), opt, function (err, stdout, stderr) {
      if (err) {
        /*debug debug('run quickweb cmd error: ' + err.stack); */
        callback(err);
      }
      else {
        /*debug debug('run quickweb cmd finish.'); */
        callback(null, stdout, stderr);
      }
    });
  }
  catch (err) {
    /*debug debug('run quickweb cmd error: ' + err.stack); */
    callback(err);
  }
}

/**
 * 合并多个对象
 *
 * @param {object} obja
 * @param {object} objb
 * @return {object}
 */
exports.merge = function () {
  var ret = {}
  for (var i in arguments) {
    var obj = arguments[i];
    for (var j in obj) {
      ret[j] = obj[j];
    }
  }
  
  return ret;
}

/**
 * 移动文件
 *
 * @param {string} source
 * @param {string} target
 * @param {function} callback
 */
exports.moveFile = function (source, target, callback) {
  try {
    // 读取源文件
    fs.readFile(source, function (err, data) {
      if (err)
        return callback(err);
      // 写到目标文件
      fs.writeFile(target, data, function (err) {
        if (err)
          return callback(err);
        // 删除源文件
        fs.unlink(source, callback);
      });
    });
  }
  catch (err) {
    return callback(err);
  }
}

/**
 * 加密密码
 *
 * @param {string} password
 * @return {string}
 */
exports.encryptPassword = function (password) {
  var random = exports.md5('QuickWeb' + Math.random()).toUpperCase();
  var left = random.substr(0, 2);
  var right = random.substr(-2);
  var newpassword = exports.md5(left + password + right).toUpperCase();
  return [left, newpassword, right].join(':');
}

/**
 * 验证密码
 *
 * @param {string} password 待验证的密码
 * @param {string} encrypted 密码加密字符串
 * @return {bool}
 */
exports.validatePassword = function (password, encrypted) {
  var random = encrypted.toUpperCase().split(':');
  if (random.length < 3)
    return false;
  var left = random[0];
  var right = random[2];
  var main = random[1];
  var newpassword = exports.md5(left + password + right).toUpperCase();
  if (newpassword === main)
    return true;
  else
    return false;
}

/**
 * 判断异常是否为语法错误
 *
 * @param {Error} e
 * @return {bool}
 */
exports.isSyntaxError = function (e) {
  // Convert error to string
  e = e && (e.stack || e.toString());
  return e && e.match(/^SyntaxError/) &&
           !(e.match(/^SyntaxError: Unexpected token .*\n/) &&
           e.match(/\n    at Object.parse \(native\)\n/));
}
