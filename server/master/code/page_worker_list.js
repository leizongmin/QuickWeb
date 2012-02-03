/**
 * Worker进程列表
 *
 */
 
var quickweb = require('quickweb');
var cluster = quickweb.Cluster; 
 
exports.path = '/page/worker_list';

// 进程列表
exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  var workers = cluster.workers;
  res.renderFile('worker_list.html', {worker: workers});
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
    }
    if (op === 'fork' || op === 'restart') {
      // 增加一个进程
      cluster.fork();
    }
    
    // 显示进程列表
    exports.get(req, res);
  });
}