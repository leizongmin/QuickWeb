var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var debug = console.log;
var web = require('../core/web');
var mustache = require('mustache');

web.set('enable render', true);
web.init();

var render_txt = function (t, v) {
	for (var i in v) {
		t = t.replace(new RegExp('%%' + i + '%%'), v[i]);
	}
	return t;
}
var v = {name: 'test'}
var text1 = 'hello, %%name%%!';
var text2 = 'hello, {{name}}!';

// 测试自定义渲染器
web.render.add('txt', render_txt);
debug(web.render.renders);
var r1 = render_txt(text1, v);
var r2 = web.render.render(text1, v, 'txt')
debug(r1);
debug(r2);
assert.ok(r1 == r2, 'web.render.add() custom render not equal: ' + r2 + ' != ' + r1);

// 测试默认渲染器
var r3 = mustache.to_html(text2, v);
var r4 = web.render.render(text2, v);
debug(r3);
debug(r4);
assert.ok(r3 == r4, 'web.render.add() default render not equal: ' + r4+ ' != ' + r3);

process.exit();