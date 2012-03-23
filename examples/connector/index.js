/**
 * QuickWeb Examples
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var quickweb = require('../../');
var tool = quickweb.import('tool');

// Connector模块
var Connector = quickweb.Connector.create;

process.chdir(__dirname);


// 添加应用
var connector = Connector();

// 应用1 域名：localhost
connector.addApp('app1', {host: 'localhost'});
connector.addFile('app1', 'test.html');
connector.addCode('app1', tool.requireFile('./test.js'));
connector.addCode('app1', tool.requireFile('./test2.js'));

// 应用2 域名：localhost/2
connector.addApp('app2', {host: 'localhost', path: '/2'});
connector.addFile('app2', 'test.html');
connector.addCode('app2', tool.requireFile('./test.js'));
connector.addCode('app2', tool.requireFile('./test2.js'));

// 应用3 域名：127.0.0.1
connector.addApp('app3', {host: '127.0.0.1'});
connector.addFile('app3', 'test.html');
connector.addCode('app3', tool.requireFile('./test.js'));
connector.addCode('app3', tool.requireFile('./test2.js'));


// 通过 connector.listener() 获取请求处理函数
var server = http.createServer(connector.listener());
server.listen(8011);
console.log('Listen on port 8011..');