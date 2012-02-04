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
  
  res.renderFile('connector_status.html', {status:   workerStatus});
}

