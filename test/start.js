/**
 * QuickWeb 单元测试
 */
 
var web = require('../core/web');

web.set('home_path', './html');
web.set('code_path', './code');
web.set('template_path', './html');
var mustache = require('mustache');
web.set('render_to_html', function () {
	return mustache.to_html.apply(null, arguments);
});

web.create();