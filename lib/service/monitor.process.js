//@jsdev(qwdebug) debug

/**
 * QuickWeb Service Monitor.process
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

 
var debug;
if (process.env.QUICKWEB_DEBUG && /monitor/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Monitor: %s', x); };
else
  debug = function() { };
  
  
// 判断操作系统类型
var os = require('os'); 
var os_type = os.type();
if (/Windows/ig.test(os_type))
  var processStat = require('./lib/process_stat_win');
else
  var processStat = require('./lib/process_stat_linux');
  
var util = require('util');
var events = require('events');  


/**
 * 创建一个进程监视器
 *
 * @param {object} options 选项
 * @return {ProcessMonitor}
 */
exports.create = function (options) {
  return new ProcessMonitor(options);
}

/**
 * 进程监视器
 *
 * @param {object} options 选项
 */
var ProcessMonitor = function (options) {
  var self = this;
  // 检查配置
  // 采集数据周期 默认20秒
  if (isNaN(options.cycle))
    options.cycle = 20000;
  // 存储数据样本个数 默认100个
  if (isNaN(options.count))
    options.count = 100;
  this.options = options;
  
  /*debug debug('new Monitor: cycle=' + options.cycle + 'ms, count=' + options.count); */
  
  // 数据
  this.data = [];
  // 监控的PID列表
  this.pid = [];
  
  // 启动监视
  this.start();
}

// 继承 events.EventEmitter
util.inherits(ProcessMonitor, events.EventEmitter);

/**
 * 监视指定进程PID
 *
 * @param {int} pid
 */
ProcessMonitor.prototype.watch = function (pid) {
  var pid = parseInt(pid);
  // 添加到PID列表
  if (this.pid.indexOf(pid) < 0)
    this.pid.push(pid);
  /*debug debug('watch pid=' + pid); */
}

/**
 * 取消监视指定进程PID
 *
 * @param {int} pid
 */
ProcessMonitor.prototype.unwatch = function (pid) {
  var pid = parseInt(pid);
  var i = this.pid.indexOf(pid);
  if (i >= 0)
    this.pid.splice(i, 1);
  /*debug debug('unwatch pid=' + pid); */
}

/**
 * 采集数据
 */
ProcessMonitor.prototype._onCycle = function () {
  var self = this;
  
  if (this.pid.length < 1)
    return;
    
  /*debug debug('get process stat PID=' + this.pid.join()); */
  processStat(this.pid, function (err, data) {
    if (err) {
      /*debug debug('get process stat error: ' + err.stack); */
      self.emit('error', err);
    }
    else {
      var timestamp = new Date().getTime();
      /*debug debug('get process stat at ' + timestamp); */
      
      self.data.push({timestamp: timestamp, data: data});
      if (self.data.length > self.options.count)
        self.data.shift();
      
      self.emit('cycle', data);
    }
  });
}

/**
 * 停止采集
 */
ProcessMonitor.prototype.stop = function () {
  /*debug debug('stop process monitor'); */
  clearInterval(this._watchTid);
}

/**
 * 重置采样周期
 *
 * @param {int} cycle
 */
ProcessMonitor.prototype.reset = function (cycle) {
  /*debug debug('reset process monitor, cycle=' + cycle); */
  if (!isNaN(cycle))
    this.options.cycle = cycle;
  this.stop();
  this.start();
}

/**
 * 启动监视
 */
ProcessMonitor.prototype.start = function () {
  var self = this;
  this._watchTid = setInterval(function () {
    self._onCycle();
  }, this.options.cycle);
  /*debug debug('start process monitor, tid=' + this._watchTid); */
}

/**
 * 取指定PID的历史信息
 *
 * @param {int} pid
 * @return {array}
 */
ProcessMonitor.prototype.getPidHistory = function (pid) {
  var ret = [];
  for (var i in this.data) {
    var d = this.data[i];
    if (pid in d.data) {
      ret.push({ timestamp: d.timestamp
               , mem:       d.data[pid].mem
               , cpu:       d.data[pid].cpu
               });
    }
  }
  return ret;
}

/**
 * 取指定PID的最后一次的状态
 *
 * @param {int} pid
 * @return {object}
 */
ProcessMonitor.prototype.getPidLastStat = function (pid) {
  var i = this.data.length - 1;
  while (i >= 0) {
    var d = this.data[i];
    if (pid in d.data) {
      return { timestamp: d.timestamp
             , mem:       d.data[pid].mem
             , cpu:       d.data[pid].cpu
             }
    }
    i--;
  }
  
  return null;
}

