/**
 * QuickWeb Command utils
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
 
var fs = require('fs');
var path = require('path');
 
 
// 输出信息
var log = function (msg) {
  console.log('  --', msg);
}
 
// 意外退出
var die = function (msg) {
  console.log('------------------ Error ---------------');
  console.error(msg);
  process.exit(-1);
}

// 正常退出
var exit = function (msg) {
  console.log('----------------- Finish ---------------');
  console.log(msg);
  process.exit();
}

// 创建目录
var mkdir = function (dir) {
  try {
    fs.mkdirSync(dir);
    log('create dir "' + dir + '"');
    return true;
  }
  catch (err) {
    if (err.toString().indexOf('EEXIST') >= 0) {
      log('dir "' + dir + '" is already exists');
      return true;
    }
    else {
      die(err.stack);
      return false;
    }
  }
}

// 创建文件
var mkfile = function (fn, data) {
  try {
    fs.writeFileSync(fn, data);
    log('create file "' + fn + '"');
    return true;
  }
  catch (err) {
    log('cannot create file "' + fn + '"\n' + err.stack);
    return false;
  }
}

// 复制文件
var cpfile = function (s, t) {
  try {
    fs.writeFileSync(t, fs.readFileSync(s));
    log('create file "' + t + '"');
    return true;
  }
  catch (err) {
    log('cannot create file "' + t + '" form "' + s + '"\n' + err.stack);
    return false;
  }
}

// 切换工作目录，如果目录不存在，则创建
var chdir = function (dir) {
  if (typeof dir !== 'string')
    dir = process.cwd();
  else
    dir = path.resolve(dir);
    
  mkdir(dir);
  
  try {
    process.chdir(dir);
    log('work dir on "' + dir + '"');
  }
  catch (err) {
    die(dir);
  }
}


// 模块输出
exports.log = log;
exports.die = die;
exports.exit = exit;
exports.mkdir = mkdir;
exports.mkfile = mkfile;
exports.cpfile = cpfile;
exports.chdir = chdir;
