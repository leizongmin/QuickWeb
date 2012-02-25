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
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  req.on('post complete', function () {
    var op = req.post.op;
    var pid = parseInt(req.post.pid);
    
    if (op === 'kill' || op === 'restart') {
      // 杀死进程
      cluster.kill(pid);
      cluster.once('death', function (w) {
        // 显示进程列表
        exports.get(req, res);
      });
    }
    if (op === 'fork' || op === 'restart') {
      // 增加一个进程
      cluster.fork(true);
      if (op === 'fork') {
        // 显示进程列表
        exports.get(req, res);
      }
    }
  });
}