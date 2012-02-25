/**
 * 出错信息
 *
 */
 
var path = require('path'); 
var fs = require('fs');
 
exports.path = '/page/error_log';

// 显示出错信息
exports.get = function (req, res) {
  res.renderFile('error_log.html'
              , {log: global.QuickWeb.master.workerException});
}

