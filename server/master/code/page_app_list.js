/**
 * 应用列表
 */
 
var fs = require('fs'); 
var path = require('path'); 
 
exports.path = '/page/app_list';

// 显示应用列表
exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  var appPath = path.resolve('./app');
  fs.readdir(appPath, function (err, apps) {
    if (err)
      res.sendError(500, err.toString());
    else {
      var data = {}
      for (var i in apps) {
        var app = {name: apps[i]}
        app.path = path.resolve(appPath, app.name);
        app.loaded = app.name in global.QuickWeb.master.applist
                   ? true : false;
        data[app.name] = app;
      }
      res.renderFile('app_list.html', {app: data});
    }
  });
}

// 载入/卸载 应用
exports.post = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  req.on('post complete', function () {
    var op = req.post.op;
    var appPath = req.post.path;
    var appName = req.post.name;
    
    var msgserver = global.QuickWeb.master.msgserver;
    var applist = global.QuickWeb.master.applist;
    
    if (op === 'load') {
      // 向各个Worker进程广播载入应用指令
      msgserver.broadcast({cmd: 'load app', dir: appPath});
      // 更新应用状态
      applist[appName] = appPath;
    }
    else {
      // 向各个Worker进程广播卸载应用指令
      msgserver.broadcast({cmd: 'unload app', dir: appPath});
      // 更新应用状态
      delete applist[appName];
    }
    
    // 显示应用列表
    exports.get(req, res);
  });
}
