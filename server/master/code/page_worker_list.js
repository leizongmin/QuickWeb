/**
 * Worker进程列表
 *
 */
 
var quickweb = require('../../../');
var cluster = quickweb.Cluster; 
 
exports.path = '/page/worker_list';

// 进程列表
exports.get = function (req, res) {
  var processMonitor = global.QuickWeb.master.processMonitor;
  
  var data = [];
  for (var i in cluster.workers) {
    var pid = cluster.workers[i].pid;
    var stat = processMonitor.getPidLastStat(pid);
    data.push({pid: pid, stat: stat});
  }
  
  res.renderFile('worker_list.html', {worker: data});
}

// 启动/杀死进程
exports.post = function (req, res) {
  req.on('post complete', function () {
    var op = req.post.op;
    var pid = parseInt(req.post.pid);
    
    // 杀死进程
    if (op === 'kill') {
      cluster.kill(pid);
      cluster.once('death', function (w) {
        exports.get(req, res);
      });
      return;
    }
    // 重启进程
    if (op === 'restart') {
      cluster.kill(pid);
      cluster.once('death', function (w) {
        exports.get(req, res);
      });
      cluster.fork(true);
      return;
    }
    // 增加进程
    if (op === 'fork') {
      cluster.fork(true);
      exports.get(req, res);
      return;
    }
    // 全部重启
    if (op === 'restart_all') {
      var pids = [];
      for (var i in cluster.workers) {
        pids.push(cluster.workers[i].pid);
      }
      restartAll(pids, function () {
        exports.get(req, res);
      });
      return;
    }
    // 其他
    else {
      return res.sendError(500, '未知操作！');
    }
  });
}

// 全部重启worker进程
var restartAll = function (pids, callback) {
  var killOne = function () {
    var pid = pids.pop();
    if (isNaN(pid))
      return callback();
    cluster.kill(pid);
    cluster.once('death', function () {
      cluster.fork(true);
      killOne();
    });
  }
  killOne();
}
