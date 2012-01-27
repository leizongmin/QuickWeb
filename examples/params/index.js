/**
 * QuickWeb Examples
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var quickweb = require('../../');


var server = http.createServer(function (req, res) {
  console.log(req.method, req.url);
  
  // 扩展request和response对象
  quickweb.extend(req, res);
  
  var printinfo = function () {
    var out = [];
    out.push(req.method + ' ' + req.url);
    
    // GET
    for (var i in req.get)
      out.push('GET ' + i + ' = ' + req.get[i]);
      
    // Cookie
    for (var i in req.cookie)
      out.push('Cookie ' + i + ' = ' + req.cookie[i]);
      
    // POST
    for (var i in req.post)
      out.push('POST ' + i + ' = ' + req.post[i]);
      
    // Upload File
    for (var i in req.file)
      out.push('File name=' + i + ', path=' + req.file[i].path
              + ', size=' + req.file[i].size);
    
    res.send(out.join('\n'));
  }
  
  // 如果是POST或PUT请求方法，需要在"post complete"事件后执行读取POST参数操作，
  // 其他请求方法则可直接操作
  if (req.method === 'POST' || req.method === 'PUT')
    req.on('post complete', printinfo);
  else
    printinfo();
  
  // 监听"post error"事件，以便检测POST解析是否成功
  req.on('post error', function (err) {
    res.sendError(500, err.stack);
  });
  
});
server.listen(8011);
console.log('Listen on port 8011..');