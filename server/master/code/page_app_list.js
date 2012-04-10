/**
 * 应用列表
 */
 
var fs = require('fs'); 
var path = require('path'); 
var quickweb = require('../../../');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
 
exports.path = '/page/app_list';

// 显示应用列表
exports.get = function (req, res) {
  var appPath = path.resolve('./app');
  fs.readdir(appPath, function (err, apps) {
    if (err)
      res.sendError(500, err.toString());
    else {
      var data = {}
      for (var i in apps) {
      
        var app = {name: apps[i]}
        app.path = path.resolve(appPath, app.name);
        app.loaded = app.name in global.QuickWeb.master.applist ? true : false;
        
        // 如果是zip文件
        if (path.extname(app.name) === '.zip') {
          app.loadact = 'unzipApp';
          app.loadactTitle = '解压';
        }
        else {
          // 检查目录里面是否有config.js文件，如果没有则忽略
          if (!app.loaded) {
            var confn = path.resolve(app.path, 'config.js');
            if (!path.existsSync(confn))
              continue;
          }
          app.loadact = app.loaded ? 'unloadApp' : 'loadApp';
          app.loadactTitle = app.loaded ? '卸载' : '载入';
        }

        data[app.name] = app;
      }
      
      res.renderFile('app_list.html', {app: data, message: res.___message});
    }
  });
}

// 载入/卸载 应用
exports.post = function (req, res) {
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
    
    // 解压文件
    else if (op === 'unzip') {
      tool.quickwebCmd( ['-unzip', appPath]
                      , function (err, stdout, stderr) {
        if (err)
          res.sendError(500, err.stack);
        else {
          res.___message = stdout + stderr;
          exports.get(req, res);
        }
      });
    }
    
    // 上传文件
    else if (op === 'upload') {
      var filename = req.file.upload.path;
      var basename = req.file.upload.name;
      // 保存到应用目录的文件名
      var savefilename = path.resolve('./app', basename);
      // 移动文件
      tool.moveFile(filename, savefilename, function (err) {
        if (err)
          return res.sendError(500, err);
          
        // 如果选择了“快速部署”
        if (req.post.quick_install) {
          tool.quickwebCmd( ['-unzip', savefilename]
                          , function (err, stdout, stderr) {
            if (err)
              return res.sendError(500, err.stack);
              
            // 删除压缩文件
            fs.unlink(savefilename, function (err) {
              if (err)
                return res.sendError(500, err.stack);
              
              // 重新加载应用
              var extname = path.extname(savefilename);
              var appName = basename.substr(0, basename.length - extname.length);
              var appPath = savefilename.substr(0, savefilename.length - extname.length);
              // 向各个Worker进程广播载入应用指令
              cluster.broadcast({cmd: 'unload app', dir: appPath});
              delete applist[appName];
              setTimeout(function () {
                // 向各个Worker进程广播卸载应用指令
                cluster.broadcast({cmd: 'load app', dir: appPath});
                // 更新应用状态
                applist[appName] = appPath;
                //console.log(appPath, appName, applist);
                return exports.get(req, res);
              }, 2000);
            });
          });
        }
        else {
          return exports.get(req, res);
        }
      });
    }
    
    else {
      res.sendError(500, '无法识别的命令：' + op);
    }
  });
}
