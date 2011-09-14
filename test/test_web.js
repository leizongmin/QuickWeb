/**
 * QuickWeb start
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */

var web = require('../core/web');


var PLUS_PATH = '../plus';			// 插件目录
var SERVER_PORT = 80;				// 服务器端口


// 设置服务器
web.set('wwwroot', './www');		// 网站目录
web.set('code_path', './code');		// 程序目录
web.set('session_maxage', 600000);	// session存活时间10分钟
web.set('template_path', './tpl');	// 模板目录


// 载入插件并启动服务器
web.loadPlus(PLUS_PATH);
var s = web.create(SERVER_PORT);

