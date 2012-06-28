//@jsdev(qwdebug) debug

/**
 * QuickWeb Cluster
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var quickweb = require('../');
var path = require('path'); 
var Service = require('./Service'); 
var cluster = require('cluster');
var util = require('util');
var events = require('events');
  
var debug;
if (process.env.QUICKWEB_DEBUG && /cluster/.test(process.env.QUICKWEB_DEBUG))
  if (cluster.isMaster) {
    debug = function(x) { console.error(' -master: %s', x); };
  }
  else {
    debug = function(x) {
      console.error('  --worker ' + process.pid + ': %s', x); 
    };
    /*debug debug('worker ' + process.pid + ' online.'); */
  }
else
  debug = function() { };
  
  
/**
 * PowerCluster对象
 */
var PowerCluster = function () {
  // 是否Master进程
  this.isMaster = cluster.isMaster;
  this.isWorker = cluster.isWorker;
  
  // Wroker进程列表
  if (cluster.isMaster)
    this.workers = [];
}

// 继承 events.EventEmitter
util.inherits(PowerCluster, events.EventEmitter);


// -------------------------------- Master进程 ----------------------------------
// 事件                参数             说明
// "worker message"    from, to, msg    worker间消息传递
// "message"           pid, msg         worker发来的消息
// "death"             worker           worker结束
// "broadcast"         pid, msg         广播消息
// "online"            worker           worker启动完毕
// "unknow"            msg              无法识别的消息
//
// 方法          参数          返回                 说明
// send          pid, msg      是否成功       
// broadcast     msg           发送给worker的数量
// getWorker     pid           worker               没找到返回null
// fork                        worker   
// kill          pid           是否成功
// killAll                     已结束的Worker进程数量
if (cluster.isMaster) {

  /**
   * Fork子进程
   *
   * @param {bool} is_forever 当进程意外结束时，是否启动fork一个新进程，默认否
   * @return {Worker}
   */
  PowerCluster.prototype.fork = function (is_forever) {
    var self = this;
    
    // fork进程
    var w = cluster.fork();
    
    // 支持Node v0.8
    if (w.process) {
      w = w.process;
      w.kill = w.destroy;
    }
    
    // 设置is_forever标志
    if (is_forever === true)
      w.is_forever = is_forever;
    this.workers.push(w);
    
    // worker进程结束
    w.on('exit', function () {
      /*debug debug('worker ' + w.pid + ' exit.'); */
      // 从workers列表中删除
      for (var i in self.workers) {
        if (self.workers[i].pid == w.pid)
          delete self.workers[i];
      }
      self.emit('death', w);
      // 如果work设置了is_forever标志，则启动fork一个新进程
      if (w.is_forever === true) {
        self.fork(true);
      }
    });
    
    // worker进程发送消息
    w.on('message', function (msg) {
      self.onWorkerMessage(w.pid, msg);
    });
    
    /*debug debug('fork a ' + (is_forever ? 'forever ' : '') + 'worker pid=' + w.pid); */
    return w;
  }
  
  /**
   * 杀死进程
   *
   * @param {int} pid 进程PID
   * @return {bool} 是否成功
   */
  PowerCluster.prototype.kill = function (pid) {
    /*debug debug('kill worker ' + pid); */
    
    // 检查是否为有效的worker
    var w = this.getWorker(pid);
    if (w === null) {
      /*debug debug('invalid worker pid ' + pid); */
      return;
    }
    
    // 去掉is_forever标志
    w.is_forever = false;
    
    try {
      return process.kill(pid);
    }
    catch (err) {
      /*debug debug('kill worker ' + pid + ' error: ' + err.stack); */
      return false;
    }
  }
  
  /**
   * 杀死所有worker进程
   *
   * @return {int} 已结束的Worker进程数量
   */
  PowerCluster.prototype.killAll = function () {
    /*debug debug('kill all workers'); */
    var ret = 0;
    for (var i in this.workers) {
      var ok = this.kill(this.workers[i].pid);
      if (ok)
        ret++;
    }
    return ret;
  }
  
  /**
   * 处理Worker发送过来的消息
   *
   * @param {int} pid 进程PID
   * @param {object} msg 消息
   */
  PowerCluster.prototype.onWorkerMessage = function (pid, msg) {
    var self = this;
    
    // worker online
    if (msg.cmd == 'online') {
      /*debug debug('worker online message'); */
      self.emit('online', self.getWorker(pid));
      return;
    }
    
    // 广播消息
    if (msg.broadcast) {
      /*debug debug('broadcast from ' + pid); */
      self.emit('broadcast', pid, msg.broadcast);
      // 将消息转发到各个Worker进程
      self.broadcast(msg.broadcast, pid);
    }
    // 普通消息
    else if (msg.message) {
      // 如果设置了pid，则是发送给某个Worker进程的
      if (parseInt(msg.pid) > 0) {
        /*debug debug('message from ' + pid + ' to ' + msg.pid); */
        self.send(msg.pid, msg.message, pid);
        self.emit('worker message', pid, msg.pid, msg.message);
      }
      // 未设置pid表示发送给master
      else {
        /*debug debug('message from ' + pid); */
        self.emit('message', pid, msg.message);
      }
    }
    // 无法识别
    else {
      /*debug debug('unknow message from ' + pid); */
      self.emit('unknow', pid, msg);
    }
  }
  
  /**
   * 获得指定PID的进程
   *
   * @param {int} pid
   * @return {Worker}
   */
  PowerCluster.prototype.getWorker = function (pid) {
    for (var i in this.workers) {
      if (this.workers[i].pid == pid)
        return this.workers[i];
    }
    /*debug debug('cannot find worker ' + pid); */
    return null;
  }
  
  /**
   * 给指定PID的进程发送消息
   *
   * @param {int} pid Worker进程PID
   * @param {object} msg 消息内容
   * @param {int} from 来源PID
   * @return {bool}
   */
  PowerCluster.prototype.send = function (pid, msg, from) {
    var w = this.getWorker(pid);
    if (w === null)
      return false;
      
    if (isNaN(from))
      from = 0;
    /*debug debug('send message to worker ' + pid); */
    return w.send({pid: from, message: msg});
  }
  
  /**
   * 向所有进程广播消息
   *
   * @param {object} msg
   * @param {int} from 来源PID
   * @return {int} >0表示成功
   */
  PowerCluster.prototype.broadcast = function (msg, from) {
    if (isNaN(from))
      from = 0;
      
    var ret = 0;
    for (var i in this.workers) {
      if (this.workers[i].pid == from)
        continue;
      var ok = this.workers[i].send({pid: from, broadcast: msg});
      if (ok)
        ret++;
    }
    /*debug debug('broadcast message to ' + ret + ' workers.'); */
    return ret;
  }
}

// -------------------------------- Worker进程 ----------------------------------
// 事件                参数             说明
// "message"           pid, msg         worker发来的消息，如果pid=0表示来自其他worker
// "broadcast"         pid, msg         广播消息，如果pid=0表示来自其他worker
// "unknow"            msg              无法识别的消息
//
// 方法           参数       返回           说明
// send           msg        是否成功       如果设置了msg.pid表示发送给其他worker
// broadcast      msg        >0表示成功
if (cluster.isWorker) {

  /**
   * 处理Master发送过来的消息
   *
   * @param {object} msg 消息
   */
  PowerCluster.prototype.onMasterMessage = function (msg) {
    // 广播消息
    if (msg.broadcast) {
      /*debug debug('broadcast from ' + (msg.pid ? msg.pid : 'master')); */
      this.emit('broadcast', msg.pid, msg.broadcast);
    }
    // 普通消息
    else if (msg.message) {
      /*debug debug('message from ' + (msg.pid ? msg.pid : 'master')); */
      this.emit('message', msg.pid, msg.message);
    }
    // 无法识别
    else {
      /*debug debug('unknow message from ' + msg.pid); */
      this.emit('unknow', msg);
    }
  }
  
  /**
   * 发送消息
   *
   * @param {int} pid 进程PID，如果未指定，则表示给Master进程发送
   * @param {object} msg 消息
   * @return {bool}
   */
  PowerCluster.prototype.send = function (pid, msg) {
    // send(msg) 或者 send(pid, msg);
    if (arguments.length < 2) {
      msg = pid;
      pid = 0;
    }
    
    // 给Master发送消息
    if (pid < 1) {
      /*debug debug('send message to master'); */
      var data = {message: msg}
    }
    // 给其他worker发送消息
    else {
      /*debug debug('send message to worker ' + pid); */
      var data = {pid: pid, message: msg}
    }
    
    return process.send(data);
  }
  
  /**
   * 广播消息
   *
   * @param {object} msg 消息
   * @return {int} >1表示成功
   */
  PowerCluster.prototype.broadcast = function (msg) {
    /*debug debug('broadcast message'); */
    var data = {broadcast: msg}
    return process.send(data) ? 1 : 0;
  }
}


// 模块输出
module.exports = new PowerCluster();
if (cluster.isWorker) {
  process.on('message', module.exports.onMasterMessage.bind(module.exports));
}
