/**
 * 服务器配置信息
 *
 */
 
var path = require('path'); 
var fs = require('fs');
 
exports.path = '/page/server_info';

// 显示应用信息
exports.get = function (req, res) {
  res.renderFile('server_info.html', {
    config: global.QuickWeb.master.config,        // 服务器配置
    online: global.QuickWeb.master.onlineAdmin    // 在线用户
  });
}

