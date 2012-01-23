/**
 * QuickWeb Master
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var http = require('http');
var quickweb = require('../');
var mq = require('./mq');


var debug;
if (process.env.QUICKWEB_DEBUG && /master/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-master: %s', x); };
else
  debug = function() { };
 
 
var mqserver, httpserver; 
 
/**
 * 启动Master进程
 *
 * @param {object} conf 配置
 */
module.exports = function (conf) {
  // 消息服务器
  mqserver = new mq.Server(conf.mq.port, conf.mq.host);
  
  // 管理界面服务器
  httpserver = http.createServer(function (req, res) {
    quickweb.extend(req);
    quickweb.extend(res);
    res.send('ok');
  });
  httpserver.listen(conf.master.port, conf.master.host);
}
