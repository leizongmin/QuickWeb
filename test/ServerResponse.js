var quickweb = require('../');
var http = require('http');

var server = http.createServer(function (req, res) {
  // 使用quickweb.extend()扩展http的response对象
  var s = new Date().getTime();
  quickweb.extend(res);
  // 可以使用quickweb提供的方法
  res.render('hello, <%=name%>', {name:'老雷'});
  var e = new Date().getTime();
  console.log(e - s, 'ms');
});
server.listen(80);

