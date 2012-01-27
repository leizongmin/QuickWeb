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
  
  // 监听 send error 事件
  res.on('send error', function (status, msg) {
    console.log('出错代码：' + status);
    console.log('出错信息：' + msg);
  });
  
  res.sendError(502, '神马都是浮云。');
  
});
server.listen(8011);
console.log('Listen on port 8011..');