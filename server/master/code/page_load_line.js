/**
 * 系统信息
 *
 */
 
var os = require('os'); 
var quickweb = require('../../../');
var cluster = quickweb.Cluster;
 
exports.path = '/page/load_line';

exports.get = function (req, res) {
  var processMonitor = global.QuickWeb.master.processMonitor;
  var config = global.QuickWeb.master.config;
  
  // 取资源占用历史信息
  var allstats = {}
  for (var i in cluster.workers) {
    var pid = cluster.workers[i].pid;
    var stats = processMonitor.getPidHistory(pid);
    if (!Array.isArray(stats))
      continue;
    for (var j in stats) {
      var s = stats[j];
      if (!allstats[s.timestamp])
        allstats[s.timestamp] = {}
      allstats[s.timestamp][pid] = { mem: s.mem, cpu: s.cpu}
    }
  }
  
  // 抽取10个样本
  var labels = Object.keys(allstats).sort();
  if (labels.length > 10) {
    // 找出样本时间戳
    var retstatus = {}
    var i = labels.length;
    var stepi = labels.length / 10;
    var need = [];
    while (i > 0) {
      var timestamp = labels[i];
      if (allstats[timestamp])
        need.unshift(timestamp);
      i = Math.round(i - stepi);
    }
    // 复制数据
    for (var i in need) {
      var timestamp = need[i];
      retstatus[timestamp] = allstats[timestamp];
    }
    var allstats = retstatus;
  }
  
  var data = { mem_line      : JSON.stringify(getMemLine(allstats))
             , cpu_line      : JSON.stringify(getCpuLine(allstats))
             , totalmem      : parseInt(os.totalmem() / 1024 / 1024)
             , totalcpu      : os.cpus().length
             , data_size     : config['status update']['load line size']
             , data_interval : config['status update']['load line']
             }
  
  res.renderFile('load_line.html', data);
}



// 计算内存占用信息数据点
var getMemLine = function (stats) {
  var ret = {}
  for (var t in stats) {
    t = parseInt(t);
    for (var pid in stats[t]) {
      if (!Array.isArray(ret[pid]))
        ret[pid] = [];
      ret[pid].push([t, parseInt(stats[t][pid].mem / 1024)]);
    }
  }
  return ret;
}

// 计算CPU占用信息数据点
var getCpuLine = function (stats) {
  var ret = {}
  for (var t in stats) {
    t = parseInt(t);
    for (var pid in stats[t]) {
      if (!Array.isArray(ret[pid]))
        ret[pid] = [];
      ret[pid].push([t, stats[t][pid].cpu]);
    }
  }
  return ret;
}
