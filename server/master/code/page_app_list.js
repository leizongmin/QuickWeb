/**
 * 应用列表
 */
 
var fs = require('fs'); 
var path = require('path'); 
var quickweb = require('quickweb');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
 
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
      res.renderFile('app_list.html', {app: data, message: res.___message});
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
    
    var applist = global.QuickWeb.master.applist;
    
    // 加载应用
    if (op === 'load') {
      // 向各个Worker进程广播载入应用指令
      cluster.broadcast({cmd: 'load app', dir: appPath});
      // 更新应用状态
      applist[appName] = appPath;
      // 显示应用列表
      exports.get(req, res);
    }
    
    // 卸载应用
    else if (op === 'unload') {
      // 向各个Worker进程广播卸载应用指令
      cluster.broadcast({cmd: 'unload app', dir: appPath});
      // 更新应用状态
      delete applist[appName];
      // 显示应用列表
      exports.get(req, res);
    }
    
    // 更新路由信息
    else if (op === 'update_route') {
      tool.quickwebCmd( ['-update-route', appPath]
                      , function (err, stdout, stderr) {
        if (err)
          res.sendError(500, err.stack);
        else {
          res.___message = stdout + stderr;
          exports.get(req, res);
        }
      });
    }
    
    // 更新压缩文件
    else if (op === 'update_compress') {
      tool.quickwebCmd( ['-update-compress', appPath]
                      , function (err, stdout, stderr) {
        if (err)
          res.sendError(500, err.stack);
        else {
          res.___message = stdout + stderr;
          exports.get(req, res);
        }
      });
    }
  });
}
