/**
 * QuickWeb start
 *
 * @author leizongmin<leizongmin@gmail.com>
 */

var web = require('QuickWeb');

// 定义日志输出等级
web.setLoggerLevel(3);

// 服务器端口
var SERVER_PORT = 80;

// 设置服务器
web.set('home_path', './www');			// 网站目录
web.set('code_path', './code');			// 程序目录
web.set('session_maxage', 600000);		// session存活时间10分钟
web.set('template_path', './tpl');		// 模板目录
web.set('template_extname', 'html');		// 模板扩展名
web.set('tmp_path', './tmp');			// 临时目录，用于POST文件上传
web.set('page_404', '文件没找到！');		// 404出错页面HTML代码

// 定义模板渲染函数
var mustache = require('mustache');
web.set('render_to_html', function (str, view) {
	return mustache.to_html(str, view);
});

var s = web.create(SERVER_PORT);

// 自定义文件类型，因为需要mime-type插件支持，所有必须等加载完插件之后
web.setMimes('cool', 'text/html');
