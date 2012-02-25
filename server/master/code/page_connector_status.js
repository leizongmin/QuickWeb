/**
 * 请求统计
 *
 */
 
var path = require('path'); 
var fs = require('fs');
 
exports.path = '/page/connector_status';

// 显示应用信息
exports.get = function (req, res) {
  var serverConfig = global.QuickWeb.master.config;
  var workerStatus = global.QuickWeb.master.workerStatus;
  var workerStatusHistory = global.QuickWeb.master.workerStatusHistory;
  
  // 返回10个数据样本
  var history = [];
  if (workerStatusHistory.length > 10) {
    var i = workerStatusHistory.length;
    var step = i / 10;
    while (i > 0) {
      if (workerStatusHistory[i])
        history.unshift(workerStatusHistory[i]);
      i = parseInt(Math.round(i - step));
    }
    if (history.length < 10 && workerStatusHistory[0]) {
      history.unshift(workerStatusHistory[0]);
    }
  }
  else {
    history = workerStatusHistory;
  }
  
  res.renderFile( 'connector_status.html'
                , { status: workerStatus
                  , history: JSON.stringify(history)
                  });
}

