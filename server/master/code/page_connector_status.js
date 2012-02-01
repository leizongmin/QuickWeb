/**
 * 请求统计
 *
 */
 
var path = require('path'); 
var fs = require('fs');
 
exports.path = '/page/connector_status';

// 显示应用信息
exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  var workerStatus = global.QuickWeb.master.workerStatus;
  var workers = global.QuickWeb.master.workers;
  
  var pid = req.get.pid;
  
  // 汇总各个进程的数据
  var astatus = {request: 0, response: 0, error: 0, url: {}}
  for (var i in workerStatus) {
    astatus.request += workerStatus[i].request;
    astatus.response += workerStatus[i].response;
    astatus.error += workerStatus[i].error;
    for (var j in workerStatus[i].url) {
      if (!astatus.url[j])
        astatus.url[j] = 1;
      else
        astatus.url[j]++;
    }
  }
  
  // 获取指定PID的数据
  if (workerStatus[pid])
    var status = workerStatus[pid];
  else
    var status = false;
  
  res.renderFile('connector_status.html'
                , { status:   status
                  , pid:      pid
                  , astatus:  astatus
                  , worker:   workerStatus
                  });
}

