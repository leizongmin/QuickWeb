/**
 * QuickWeb start
 *
 * @author leizongmin<leizongmin@gmail.com>
 */

var web = require('QuickWeb');

// 定义模板渲染函数
var mustache = require('mustache');
web.set('render_to_html', function (str, view) {
	return mustache.to_html(str, view);
});
web.set('template_extname', 'html');	// 模板后缀名

// 创建http服务器，并监听80端口
web.create();

// 自定义文件类型，因为需要mime-type插件支持，所有必须等加载完插件之后
web.setMimes('cool', 'text/html');
