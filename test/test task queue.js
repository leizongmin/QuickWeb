var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var debug = console.log;
var web = require('../core/web');

web.set('enable task queue', true);
web.create();

var e = new EventProxy();
e.assign('#1', function () {
	process.exit();
});

// web.task.add()
var queue = web.task.queue;
web.task.add('test1', function () {}, 10000);
assert.ok('test1' in queue, 'web.task.add() #1 not in queue');
assert.ok(queue['test1'].cycle == 10000, 'web.task.add() #2 cycle not equal: ' + 
		queue['test1'].cycle + ' != 10000');

// web.task.remove()
web.task.remove('test1');
assert.ok(!('test1' in queue), 'web.task.remove() #1 cannot remove');

// 测试是否在指定时间执行了
var i = 0;
var has_remove = false;
web.task.add('test2', function () {
	if (has_remove)
		assert.ok(false, 'web.task #1 do web.task.remove(), task not removed');
	i++;
	if (i > 2) {
		web.task.remove('test2');
		has_remove = true;
	}
}, 500);
setTimeout(function () {
	debug('i = ' + i);
	debug(queue);
	assert.ok( i > 2, 'web.task #2 task only run ' + i + ' times');
	e.trigger('#1');
}, 2000);