//@jsdev(qwdebug) debug

/**
 * QuickWeb Service AsyncTask
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var util = require('util');
var events = require('events');  
var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /task/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('AsyncTask: %s', x); };
else
  debug = function() { };
  
  

/**
 * 创建一个并行异步调用模型
 *
 * @param {function} funcAssign 分割任务函数，输入格式：function (input)
 *                              返回一个数组，每个元素格式：{key: '键名', value: 输入值}
 * @param {function} funcTask 任务执行函数，格式：function (input, function (err, output))
 */
var Parallel = function (funcAssign, funcTask) {
  if (!(this instanceof Parallel))
    return new Parallel(funcAssign, funcTask);
  
  if (!funcAssign && !funcTask)
    throw Error('At least need a parameter.');
    
  if (funcAssign && !funcTask) {
    funcTask = funcAssign;
    funcAssign = function (input) {
      return input;
    }
  }
  this._function = {assign: funcAssign, task: funcTask}
}
util.inherits(Parallel, events.EventEmitter);

/**
 * 开始任务
 *
 * @param {array} input 任务输入数据数组
 * @param {function} callback 回调函数
 */
Parallel.prototype.start = function (input, callback) {
  if (typeof callback === 'function')
    this.on('end', callback);
    
  // 分割任务
  var tasks = this._function.assign(input);
  var taskLength = tasks.length;
  
  // 并行执行各个任务
  var self = this;
  var taskFunc = this._function.task;
  var output = [];
  var finishSum = 0;
  var checkFinish = function () {
    if (finishSum >= taskLength)
      self.emit('end', output);
  }
  var startTask = function (t) {
    taskFunc(t.value, function (err, data) {
      finishSum++;
      if (err) {
        self.emit('error', err, t);
      }
      else {
        output.push({key: t.key, value: data});
        self.emit('one', {key: t.key, output: data, rate: finishSum / taskLength});
      }
      checkFinish();
    });
  }
  for (var i = 0; i < taskLength; i++) {
    var t = tasks[i];
    try {
      startTask(t);
    }
    catch (err) {
      finishSum++;
      this.emit('error', err, t);
      checkFinish();
    }
  }
}

/**
 * 创建一个队列任务
 *
 * @param {function} funcAssign 分割任务函数，输入格式：function (input)
 *                              返回一个数组，每个元素格式：{key: '键名', value: 输入值}
 * @param {function} funcTask 任务执行函数，格式：function (input, function (err, output))
 */
var Queue = function (funcAssign, funcTask) {
  if (!(this instanceof Queue))
    return new Queue(funcAssign, funcTask);
    
  if (!funcAssign && !funcTask)
    throw Error('At least need a parameter.');
    
  if (funcAssign && !funcTask) {
    funcTask = funcAssign;
    funcAssign = function (input) {
      return input;
    }
  }
    
  this._function = {assign: funcAssign, task: funcTask}
}
util.inherits(Queue, events.EventEmitter);


/**
 * 开始任务
 *
 * @param {array} input 任务输入数据数组
 * @param {function} callback 回调函数
 */
Queue.prototype.start = function (input, callback) {
  if (typeof callback === 'function')
    this.on('end', callback);
    
  // 分割任务
  var tasks = this._function.assign(input);
  var taskLength = tasks.length;
    
  // 执行任务队列
  var self = this;
  var i = -1;
  var output = [];
  var taskFunc = this._function.task;
  var next = function () {
    i++;
    // 如果任务完成，则返回结果
    if (i >= taskLength) {
      return self.emit('end', output);
    }
    
    // 当前任务数据
    var t = tasks[i];
    
    // 运行任务
    try {
      taskFunc(t.value, function (err, data) {
        if (err) {
          self.emit('error', err, t);
        }
        else {
          output.push({key: t.key, value: data});
          self.emit('one', {key: t.key, output: data, rate: i / taskLength});
        }
        next();
      });
    }
    catch (err) {
      self.emit('error', err, t);
      next();
    }
  }
  next();
}


// 模块输出
exports.Parallel = Parallel;
exports.Queue = Queue;


/*
// Queue使用示例：
var q = Queue(function (input, callback) {
  console.log('输入：', input);
  setTimeout(function () {
    if (input < 1)
      callback(Error('Num less than 1'));
    else
      callback(null, input);
  }, 100);
});
console.log(q);
var E = function (v) { return {key: 'key' + v, value: v} }
q.start([E(1),E(2),E(0),E(3),E(5),E(-1),E(0)], function (output) {
  console.log('结果：', output);
});
q.on('one', function (one) {
  console.log('完成进度：', one);
});
q.on('error', function (err) {
  console.error('出错了：' + err.stack);
});
*/
/*
// Parallel使用示例
var p = Parallel(function (input, callback) {
  console.log('输入：', input);
  setTimeout(function () {
    if (input < 1)
      callback(Error('Num less than 1'));
    else
      callback(null, input);
  }, Math.random() * 1000);
});
console.log(p);
var E = function (v) { return {key: 'key' + v, value: v} }
p.start([E(1),E(2),E(0),E(3),E(5),E(-1),E(0)], function (output) {
  console.log('结果：', output);
});
p.on('one', function (one) {
  console.log('完成进度：', one);
});
p.on('error', function (err, input) {
  console.error('出错了：' + err.stack, input);
});
*/