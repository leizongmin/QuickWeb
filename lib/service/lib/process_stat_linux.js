//@jsdev(qwdebug) debug

/**
 * 取进程资源占用信息 For Linux/Unix
 */
 
var fs = require('fs');


/**
 * 取指定PID占用内存信息
 *
 * @param {int} pid
 * @param {function} cb 回调函数 err, data
 */
var getProcessMem = function (pid, cb) {
  // 读取 /proc/pid/status
  var filename = '/proc/' + pid + '/status';
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err)
      cb(err);
    else {
      // 分析文件内容
      var is = data.indexOf('VmRSS:');
      var ie = data.indexOf('kB', is + 1);
      if (is < 0 || ie < 0) {
        cb(Error('parse file ' + filename + ' error!'));
        return;
      }
      var mem = data.substr(is + 7, ie - is).trim();
      // 单位 kB
      mem = parseInt(mem);
      cb(null, mem);
    }
  });
}

/**
 * 取指定PID占用单个CPU时间
 *
 * @param {int} pid
 * @param {function} cb 回调函数 err, data
 */
var getProcessCpuUsage = function (pid, cb) {
  // 读取 /proc/pid/stat
  var filename = '/proc/' + pid + '/stat';
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err)
      cb(err);
    else {
      // 分析文件内容
      var elems = data.split(' ');
      var utime = parseInt(elems[13]);
      var stime = parseInt(elems[14]);
      if (isNaN(utime) || isNaN(stime)) {
        cb(Error('parse file ' + filename + ' error!'));
        return;
      }
      // 单位 ms
      cb(null, utime + stime);
    }
  });
}

/**
 * 取指定PID占用单个CPU百分比
 *
 * @param {int} pid
 * @param {function} cb 回调函数 err, data
 */
var getProcessCpuPercentage = function (pid, cb) {
  // 读取当前时刻CPU时间
  getProcessCpuUsage(pid, function (err, t1) {
    if (err) {
      cb(err);
      return;
    }
    // 记录开始时间
    var ts = new Date().getTime();
    // 读取下一秒的CPU时间
    setTimeout(function () {
      getProcessCpuUsage(pid, function (err, t2) {
        if (err) {
          cb(err);
          return;
        }
        
        // 记录结束时间
        var te = new Date().getTime();
        
        // 计算结果
        var delta = t2 - t1;
        var td = te - ts;
        var percentage = parseInt((delta / td) * 100);
        if (percentage > 100)
          percentage = 100;
        // 单位 %
        cb(null, percentage);
      });
    }, 1000);
  });
}

/**
 * 取指定一组PID的资源占用信息
 *
 * @param {array} pids PID数组
 * @param {function} cb 回调函数 err, data
 */
var processStat = function (pids, cb) {
  var ret = {}
  var reti = 0;
  var retData = function (err, d) {
    reti++;
    if (!err)
      ret[d.pid] = {mem: d.mem, cpu: d.cpu}
    if (reti >= pids.length)
      cb(null, ret);
  }
  // 获取各个进程的信息
  for (var i in pids) {
    var pid = pids[i];
    getPidStat(pid, retData);
  }
}

/**
 * 取指定PID进程资源占用信息
 *
 * @param {int} pid
 * @param {function} cb 回调函数 err, data
 */
var getPidStat = function (pid, cb) {
  var ret = {i: 0}
  var check = function () {
    ret.i++;
    if (ret.i >= 2) {
      // 返回数据
      if (ret.mem_err)
        cb(ret.mem_err);
      else if (ret.cpu_err)
        cb(ret.cpu_err);
      else
        cb(null, {pid: pid, mem: ret.mem, cpu: ret.cpu});
    }
  }
  // 取内存信息
  getProcessMem(pid, function (err, d) {
    if (err)
      ret.mem_err = err;
    else
      ret.mem = d;
    check();
  });
  // 取单个CPU百分比
  getProcessCpuPercentage(pid, function (err, d) {
    if (err)
      ret.cpu_err = err;
    else
      ret.cpu = d;
    check();
  });
}

/*
function start() {
var PID = [3236, 2604];
var cpus = require('os').cpus().length;
  processStat(PID, console.log);
}
setInterval(start, 2000);
start();
*/

module.exports = processStat;
