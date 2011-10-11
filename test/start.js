/**
 * QuickWeb 单元测试
 */
 
var web = require('../core/web');

var path = require('path');
web.set('home_path', path.resolve(__dirname, './html'));
web.set('code_path', path.resolve(__dirname, './code'));
web.set('template_path', path.resolve(__dirname, './html'));
var mustache = require('mustache');
web.set('render_to_html', function () {
	return mustache.to_html.apply(null, arguments);
});

web.create();