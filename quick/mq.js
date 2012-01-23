/**
 * QuickWeb Quick MQ
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../');
var net = require('net');
var util = require('util');
var events = require('events');


var debug;
if (process.env.QUICKWEB_DEBUG && /quick/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('MQ: %s', x); };
else
  debug = function() { };
  

/**
 * 服务器端
 *
 * @param {int} port 端口
 */
var Server = exports.Server = function (port) {
  // 默认端口为15555
  if (isNaN(port))
    port = 15555;
  this.port = port;
  
  // 创建服务器
  var self = this;
  this.client = {};
  this._client_count = 0;
  this.socket = net.createServer(function (c) {
    self._client_count++;
    var cid = self._client_count;
    debug('client connected: ' + cid);
    self.client[cid] = c;
    
    var clientClose = function () {
      debug('client disconnected.');
      delete self.client[cid];
    }
    c.on('end', clientClose);
    c.on('close', clientClose);
    
    c.on('data', function (data) {
      self.onmessage(cid, data);
    });
  });
  this.socket.listen(this.port, function () {
    debug('listen on port ' + self.port);
  });
}
util.inherits(Server, events.EventEmitter);

/**
 * 解析消息
 *
 * @param {int} cid 客户端ID
 * @param {buffer} data
 */
Server.prototype.onmessage = function (cid, data) {
  try {
    data = JSON.parse(data);
    // 触发message事件
    this.emit('message', cid, data.msg, data.data);
  }
  catch (err) {
    debug('parse data error: ' + err.statck);
  }
}

/**
 * 发送消息
 *
 * @param {int} pid 客户端ID
 * @param {string} msg 消息
 * @param {object} data 内容
 */
Server.prototype.send = function (pid, msg, data) {
  var d = { msg:    msg
          , data:   data || {}
          }
  var socket = this.client[pid];
  if (socket)
    socket.write(JSON.stringify(d));
  else
    debug('cannot find client ' + pid);
}


/**
 * 客户端
 *
 * @param {int} port 端口
 * @param {string} host 主机
 */
var Client = exports.Client = function (port, host) {
  if (isNaN(port))
    port = 15555;
  if (typeof host != 'string')
    host = '127.0.0.1';
  this.port = port;
  this.host = host;
    
  // 连接到服务器
  var self = this;
  this.socket = net.createConnection(this.port, this.host, function () {
    debug('connected to server.');
    self.socket.on('data', function (data) {
      self.onmessage(data);
    });
  });
}
util.inherits(Client, events.EventEmitter);

/**
 * 解析消息
 *
 * @param {buffer} data
 */
Client.prototype.onmessage = function (data) {
  try {
    data = JSON.parse(data);
    // 触发message事件
    this.emit('message', data.msg, data.data);
  }
  catch (err) {
    debug('parse data error: ' + err.statck);
  }
}

/**
 * 发送消息
 *
 * @param {string} msg 消息
 * @param {object} data 内容
 */
Client.prototype.send = function (msg, data) {
  var d = { pid:    process.pid
          , msg:    msg
          , data:   data || {}
          }
  this.socket.write(JSON.stringify(d));
}

