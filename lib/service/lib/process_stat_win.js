//@jsdev(qwdebug) debug

/**
 * 取进程资源占用信息 For Windows
 */
 
var cp = require('child_process');


/**
 * 执行tasklist命令，返回执行结果
 *
 * @param {array} pids PID数组
 * @param {function} cb 回调函数 err, data
 */
var runTasklist = function (pids, cb) {
  if (pids.length == 1)
    var cmd = 'tasklist /V /FO CSV /NH /FI "PID eq ' + pids[0] + '"';
  else
    var cmd = 'tasklist /V /FO CSV /NH';
    
  var p = cp.exec(cmd, function (err, stdout, stderr) {
    if (err)
      cb(err);
    else {
      if (stderr.trim() !== '')
        cb(stderr);
      else
        cb(null, stdout);
    }
  });
}

/**
 * 解析tasklist输出的数据
 *
 * @param {string} data 文本
 * @param {array} pids 要筛选的PID
 * @return {array}
 */
var parseProcessInfo = function (data, pids) {
  // 分析出各个进程
  var lines = data.split(/\r?\n/ig);
  var list = {};
  for (var i in lines) {
    var fields = lines[i].substr(1, lines[i].length - 2).split('","');
    var info = {}
    info.mem = fields[4];
    info.cpu = fields[7];
    list[fields[1]] = info;
  }
  
  // 筛选指定PID的进程
  if (Array.isArray(pids)) {
    var _list = {}
    for (var i in pids) {
      var pid = pids[i];
      if (pid in list)
        _list[pid] = list[pid];
    }
    list = _list;
  }
  
  // 解析详细信息
  for (var i in list) {
    var t = list[i];
    // 内存占用 单位：KB
    t.mem = parseInt(t.mem.replace(',', '').replace('K', ''));
    var s = t.cpu.split(':');
    // 单个CPU时间 单位：s
    t.cpu = parseInt(s[0]) * 3600 + parseInt(s[1]) * 60 + parseInt(s[2]);
  }
  
  return list;
}

/**
 * 取指定一组PID的资源占用信息
 *
 * @param {array} pids PID数组
 * @param {function} cb 回调函数 err, data
 */
var processStat = function (pids, cb) {
  // 记录开始运行的时间
  var s = new Date().getTime();
  // 获取第一次的进程信息
  runTasklist(pids, function (err, data) {
    if (err) {
      cb(err);
      return;
    }
    
    var ts1 = parseProcessInfo(data, pids);
    
    // 获取第二次的进程信息
    setTimeout(function () {
      runTasklist(pids, function (err, data) {
        if (err) {
          cb(err);
          return;
        }
        
        // 记录结束时间
        var e = new Date().getTime();
        var ts2 = parseProcessInfo(data, pids);
        
        // 解算结果
        var delta = (e - s) / 1000;
        var ret = {}
        for (var i in ts2) {
          if (ts1[i] && ts2[i]) {
            // 返回 cpu:单个CPU占用百分比, mem:内存占用KB
            ret[i] = { cpu:   parseInt(((ts2[i].cpu - ts1[i].cpu) / delta) * 100)
                     , mem:   ts2[i].mem
                     }
            if (ret[i].cpu > 100)
              ret[i].cpu = 100;
            else if (ret[i].cpu < 0)
              ret[i].cpu = 0;
          }
        }
        cb(null, ret);
      });
    }, 10000);
  });
}

/*
var cpus = require('os').cpus().length;
var start = function () {
  processStat([5776, 6196, 6524, 244], function (err, data) {
    if (err)
      console.log(err);
    else {
      for (var i in data)
        console.log('PID: ' + i + '  cpu: ' + (data[i].cpu / cpus) + '%  mem: ' + data[i].mem + 'K');
    }
  });
}
setInterval(start, 5000);
start();
*/

module.exports = processStat;
