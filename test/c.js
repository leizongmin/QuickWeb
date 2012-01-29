var quickweb = require('../');
var http = require('http');
var cluster = require('cluster');

/*
if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
}
else {
*/
  var connector = quickweb.Connector.create();
  var server = http.createServer(connector.listener());
  server.listen(80);
  
  connector.addApp('test', { path: '/test', host: ['127.0.0.1', 'localhost'], appdir: '.'
                           , response: { 'enable gzip': true}
                           });
  connector.addFile('test', 'test.txt');
  connector.addCode('test', { path:  '/test.aspx'
                               , get:   function (req, res) { res.send('hello'); }
                               });
  /*
  var server = http.createServer(function (req, res) {
    quickweb.extend(req, res);
    res.end('hello');
  });
  */
  server.listen(80);
  
//}
                             