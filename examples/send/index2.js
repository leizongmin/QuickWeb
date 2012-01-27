/**
 * QuickWeb Examples
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var quickweb = require('../../');

process.chdir(__dirname);

var server = http.createServer(function (req, res) {
  console.log(req.method, req.url);
  
  // 扩展request和response对象
  quickweb.extend(req, res);
  
  var sendbottom = false;
  
  switch (parseInt(req.get.a)) {
    case 1:
      res.sendJSON({a:123456, b:1234, c:'Hello'}, sendbottom = true);
      break;
    case 2:
      res.renderFile('tpl.html', {value: Math.random()}, sendbottom = true);
      break;
    case 3:
      res.sendError(501, '神马都是浮云');
      break;
    case 4:
      res.redirect('/');
      break;
    case 5:
      res.sendFile('tpl.html', sendbottom = true);
      break;
    case 6:
      res.sendStaticFile('tpl.html');
      break;
    default:
      res.sendFile('index.html', sendbottom = true);
  }
  
  if (sendbottom === true) {
    res.send('<hr>', true);
    res.sendFile('index.html');
  }
  
});
server.listen(8011);
console.log('Listen on port 8011..');