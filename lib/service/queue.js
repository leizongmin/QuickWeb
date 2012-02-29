//@jsdev(qwdebug) debug

/**
 * QuickWeb Service queue
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var fs = require('fs');
var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Queue: %s', x); };
else
  debug = function() { };
  
  

/**
 * 等待队列，当已有线程在执行相同的操作时，等待其执行完毕后再执行
 *
 * @param {object} queue 队列对象
 * @param {string} key 操作名称
 * @param {function} cb1 如果队列中已有相同的操作，则等待其执行完毕再执行此函数
 * @param {function} cb2 如果队列中没有相同的操作，则直接执行此函数
 *                       此函数接收一个参数，用于在执行完毕后调用
 *                       其所回传的参数将被传递到等待队列中的所有回调函数
 * @param {function} mcb 仅当为第一个操作时需要执行的函数
 */
exports.wait = function (queue, key, cb1, cb2, mcb) {

  // 队列有相同的操作，则将当前读取操作添加到队列
  var keyarr = queue[key];
  if (Array.isArray(keyarr)) {
    keyarr.push(cb1);
    /*debug debug('wait queue ' + key + ' ' + queue[key].length); */
  }
  
  // 队列中没有相同的操作
  else {
    // 初始化队列
    queue[key] = [];
    
    cb2(function () {
      /*debug debug('queue ' + key + ' finish'); */
      
      // 保存此操作返回的参数列表
      var args = arguments;
      
      // 先调用第一个读取操作的回调，然后依次回调队列
      mcb.apply(null, args);
      
      var cb;
      while (cb = queue[key].shift())
        cb.apply(null, args);
      
      // 删除该队列
      delete queue[key];
      
      /*debug debug('empty queue ' + key); */
    });
  }
}
