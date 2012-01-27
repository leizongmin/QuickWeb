/**
 * QuickWeb Examples
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var quickweb = require('../../');

process.chdir(__dirname);

// 载入route模块
var Route = quickweb.import('route').create;

// 设置路由
var route = Route();

route.add('/', function (req, res) {
  res.sendFile('index.html');
});

route.add('/hello', function (req, res) {
  res.sendJSON({a: 'hello', b: Math.random()});
});



var server = http.createServer(function (req, res) {
  console.log(req.method, req.url);
  
  // 扩展request和response对象
  quickweb.extend(req, res);
  
  // 查询路由
  var h = route.query(req.filename);
  
  if (h === null)
    res.sendError(500, '没有相应的路由处理程序！');
  else
    h.handle(req, res);
  
});
server.listen(8011);
console.log('Listen on port 8011..');