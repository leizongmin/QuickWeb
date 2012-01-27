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
  
  // 监听 header before 事件
  res.on('header before', function () {
    // 在输出响应头之前，增加一个 Server: QuickWeb-Examples
    res.setHeader('Server', 'QuickWeb-Examples');
  });
  
  // 监听 header after 事件
  res.on('header after', function () {
    res.send('header after\n', true);
  });
  
  // 监听 end 事件
  res.on('end', function () {
    console.log('on end.');
  });
  
  res.send('hello, world!');
  
});
server.listen(8011);
console.log('Listen on port 8011..');