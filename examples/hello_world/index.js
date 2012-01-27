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
  
  res.send('hello, world!');
  
});
server.listen(8011);
console.log('Listen on port 8011..');