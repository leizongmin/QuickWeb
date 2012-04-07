/**
 * 列出目录
 */
 
var fs = require('fs'); 
var path = require('path'); 
var quickweb = require('../../../');
var tool = quickweb.import('tool');
var Parallel = quickweb.import('asynctask').Parallel;
var cluster = quickweb.Cluster;
 
exports.path = '/page/list_dir';

// 显示应用列表
exports.get = function (req, res) {
  
  // 服务器路径
  var basePath = path.resolve('.');
  
  // 路径，出于安全考虑，只运行访问当前服务器路径下的文件
  var p = path.resolve(basePath, req.get.path);
  if (p.substr(0, basePath.length) !== basePath) {
    return res.sendError(403, '没有权限访问该路径！')
  }
  
  // 列出该目录下的文件
  fs.readdir(p, function (err, list) {
    if (err)
      return res.sendError(500, err);
      
    var FATHER_DIR = {
      name:   '..',
      path:   path.resolve(p, '..'),
      size:   0,
      mtime:  new Date(),
      type:   'dir'
    }
      
    // 如果是空目录，直接显示
    if (list.length < 1) {
      return res.renderFile('list_dir.html', {
        list:   [FATHER_DIR],
        path:   p
      });
    }
      
    var task = Parallel(function (input, callback) {
      fs.stat(input, callback);
    });
    
    var V = function (input) {
      return {key: input, value: path.resolve(p, input)}
    }
    var _data = [];
    for (var i in list)
      _data.push(V(list[i]));
    
    task.start(_data, function (data) {
     
      var list = [FATHER_DIR];
      for (var i in data) {
        list.push({
          name:   data[i].key,
          path:   path.resolve(p, data[i].key),
          size:   data[i].value.size,
          mtime:  data[i].value.mtime,
          type:   data[i].value.isDirectory() ? 'dir' : 'file'
        });
      }
      
      res.renderFile('list_dir.html', {
        list:   list,
        path:   p
      });
    });
    
  });
  
}



// 删除文件
exports.post = function (req, res) {
  req.on('post complete', function () {
    
    var filename = req.post.path;
    var op = req.post.op;
    
    if (op === 'remove') {
      fs.unlink(filename, function (err) {
        if (err)
          res.sendError(500, err);
          
        return exports.get(req, res);
      });
    }
    
    else { 
      res.sendError(500, '无法识别的指令！');
    }
  });
  req.on('post error', function (err) {
    res.sendError(500, err);
  });
}