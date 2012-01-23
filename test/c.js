var quickweb = require('../');
var http = require('http');

var connector = quickweb.Connector.create();
var server = http.createServer(connector.listener());
server.listen(81);


connector.addApp('test', { path: '/test', host: ['127.0.0.1', 'localhost'], appdir: '.'});
connector.addFile('test', 'c.js', 'e:\\github\\QuickWeb\\test\\c.js');
connector.addCode('test', { path:  '/a'
                             , get:   function (req, res) { res.send('lll'); }
                             });
connector.addCode('test', { path:  '/file/:name.html'
                             , get:   function (req, res) { res.send(req.path.name); }
                             });
connector.addCode('test', { path:  /d+/
                             , get:   function (req, res) { res.send(req.url); }
                             });
                             