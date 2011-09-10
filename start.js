/**
 * QuickWeb start
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */

var plus = require('./core/plus');
var web = require('./core/web');


var PLUS_PATH = './plus';			// 插件目录
var SERVER_PORT = 80;				// 服务器端口


// 设置服务器
web.set('wwwroot', './www');		// 网站目录


// 载入插件并启动服务器
plus.load(PLUS_PATH);
var s = web.create(SERVER_PORT);

