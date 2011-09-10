/**
 * QuickWeb 事件管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var event = module.exports;

var logger = require('./logger');
var debug = event.logger = function (msg) {
	logger.log('event', msg);
}


/**
 * 创建一个事件监听器
event.EventEmitter = function () {
	this._listener = [];
}