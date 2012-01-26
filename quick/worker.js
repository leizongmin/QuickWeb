/**
 * QuickWeb Worker
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var http = require('http');
var quickweb = require('../');
var mq = require('./mq');


var debug;
if (process.env.QUICKWEB_DEBUG && /worker/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-worker: %s', x); };
else
  debug = function() { };
 
 
/**
 * 启动Worker进程
 *
 * @param {object} conf 配置
 */
module.exports = function (conf) {
  // 创建连接管理器
  var connector = quickweb.Connector.create();
  // 监听HTTP端口
  connector.http = {}
  if (!Array.isArray(conf['listen http']))
    conf['listen http'] = [80];
  for (var i in conf['listen http']) {
    var port = Number(conf['listen http'][i]);
    var s = http.createServer(connector.listener());
    s.listen(port);
    connector.http[port] = s;
  }
  
  // 启动消息客户端
  mqclient = new mq.Client(conf.mq.port, conf.mq.host);
  // 解析命令
  mqclient.on('message', function (msg, data) {
    if (msg === 'load-app') {
    
    }
  });
}
