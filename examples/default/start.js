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
var path = require('path');
web.set({
	'home_path':	 path.resolve(__dirname, './html'),		// 网站根目录
	'code_path':	 path.resolve(__dirname, './code'),		// 程序目录
	'template_path': path.resolve(__dirname, './tpl'),		// 模板目录
	'tmp_path':		 path.resolve(__dirname, './tmp'),		// 临时目录，用于POST文件上传
	'session_maxage':	600000,								// session存活时间10分钟
	'template_extname':	'html',								// 模板扩展名
	'page_404':		'文件没找到！'							// 404出错页面HTML代码
});
//web.set('file_cache_maxage', 10);		// 文件缓存存活时间
//web.set('file_cache_recover', 30);		// 文件缓存回收周期

// 定义模板渲染函数
var mustache = require('mustache');
web.set('render_to_html', function (str, view) {
	return mustache.to_html(str, view);
});


// 载入APP
// web.loadApp(path.resolve(__dirname, './app/testapp'));


var s = web.create(SERVER_PORT);

// 自定义文件类型，因为需要mime-type插件支持，所有必须等加载完插件之后
web.setMimes('cool', 'text/html');

// 缓存文件
//web.file.load('./www/index.html');