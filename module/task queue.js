/**
 * QuickWeb task queue
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;


/** 初始化 */
exports.init = function () {
	// web.task 命名空间
	if (typeof web.task == 'undefined')
		web.task = {}
	// 任务队列
	web.task.queue = {}
}

/** 开启 */
exports.enable = function () {
	// 添加任务
	web.task.add = addTask;
	// 删除任务
	web.task.remove = removeTask;
}

/** 关闭 */
exports.disable = function () {
	var showError = function () {
		web.logger.warn('task queue not enable');
	}
	web.task.add = showError;
	web.task.remove = showError;
}

/**
 * 添加任务
 *
 * @param {string} name 任务名称
 * @param {function} taskfn 任务代码
 * @param {int} cycle 周期，毫秒
 */
var addTask = function (name, taskfn, cycle) {
	var t = {
		func:	taskfn,
		cycle:	cycle
	}
	t.id = setInterval(t.func, t.cycle);
	// 保存到任务队列中，如果已存在相同的任务，则先停止原来的任务
	var queue = web.task.queue;
	if (name in queue)
		clearInterval(queue[name].id);
	queue[name] = t;
	web.logger.info('web.task.add(): ' + name + ', ' + cycle);
}

/**
 * 删除任务
 *
 * @param {string} name 任务名称
 */
var removeTask = function (name) {
	var queue = web.task.queue;
	if (name in queue) {
		clearInterval(queue[name].id);
		delete queue[name];
		web.logger.info('web.task.remove(): ' + name);
	}
}