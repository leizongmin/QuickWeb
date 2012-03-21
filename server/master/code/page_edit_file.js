/**
 * 编辑文件
 */
 
var fs = require('fs'); 
var path = require('path'); 
var quickweb = require('../../../');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
 
exports.path = '/page/edit_file';

// 显示应用列表
exports.get = function (req, res) {
  
  // 服务器路径
  var basePath = path.resolve('.');
  
  // 路径，出于安全考虑，只运行访问当前服务器路径下的文件
  var p = path.resolve(basePath, req.get.path);
  if (p.substr(0, basePath.length) !== basePath) {
    return res.sendError(403, '没有权限访问该路径！')
  }
  
  // 读取文件内容
  fs.readFile(p, 'utf8', function (err, data) {
    if (err)
      res.sendError(500, err);
      
    // 文件类型
    var extname = path.extname(p);
    var T = {
      '.js':    'javascript',
      '.json':  'json',
      '.css':   'css',
      '.html':  'html',
      '.htm':   'html',
      '.coffee':'coffee'
    }
    var mode = T[extname] || 'javascript';
    
    res.renderFile('edit_file.html', {
      path:   p,
      data:   data,
      mode:   mode
    });
  });
  
}


// 保存文件
exports.post = function (req, res) {
  req.on('post complete', function () {
    
    var filename = req.post.path;
    var data = req.post.data;
    
    fs.writeFile(filename, data, function (err) {
      if (err)
        return res.sendError(500, err);
        
      req.get.path = filename;
      return exports.get(req, res);
    });
    
  });
  req.on('post error', function (err) {
    res.sendError(500, err);
  });
}