/**
 * 系统信息
 *
 */
 
var os = require('os'); 
var quickweb = require('quickweb');
var cluster = quickweb.Cluster;
 
exports.path = '/page/load_line';

exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  var processMonitor = global.QuickWeb.master.processMonitor;
  var config = global.QuickWeb.master.config;
  
  // 取资源占用历史信息
  var allstats = {}
  for (var i in cluster.workers) {
    var pid = cluster.workers[i].pid;
    var stats = processMonitor.getPidHistory(pid);
    allstats[pid] = stats;
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
  for (var pid in stats) {
    var ps = stats[pid];
    ret[pid] = [];
    for (var i in ps)
      ret[pid].push([ps[i].timestamp, parseInt(ps[i].mem / 1024)]);
  }
  return ret;
}

// 计算CPU占用信息数据点
var getCpuLine = function (stats) {
  var ret = {}
  for (var pid in stats) {
    var ps = stats[pid];
    ret[pid] = [];
    for (var i in ps)
      ret[pid].push([ps[i].timestamp, ps[i].cpu]);
  }
  return ret;
}
