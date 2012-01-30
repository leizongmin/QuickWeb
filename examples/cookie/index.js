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
  
  var html = '';
  for (var i in req.cookie)
    html += i + '=' + req.cookie[i] + '<br>';
  html += '<hr>';
  
  if (req.url === '/set') {
    res.setCookie('a', Math.random(), {maxAge: 60});
    res.setCookie('b', Math.random(), {maxAge: 10});
  }
  else if (req.url === '/clear') {
    res.clearCookie('a');
    res.clearCookie('b');
  }
  
  html += '<a href="/set">设置Cookie</a><br>'
        + '<a href="/clear">清除Cookie</a>';
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
  
});
server.listen(8011);
console.log('Listen on port 8011..');