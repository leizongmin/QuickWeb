/**
 * QuickWeb start
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
 */

var web = require('../core/web');


var SERVER_PORT = 80;				// 服务器端口


// 设置服务器
web.set('home_path', './www');			// 网站目录
web.set('code_path', './code');			// 程序目录
web.set('session_maxage', 600000);		// session存活时间10分钟
web.set('template_path', './tpl');		// 模板目录
web.set('template_extname', 'html');	// 模板扩展名
web.set('tmp_path', './tmp');			// 临时目录，用于POST文件上传


// 载入插件并启动服务器
var PLUS_PATH = './plus/web';			// 自定义插件目录
//web.loadPlus(PLUS_PATH);				// 载入所有插件
web.loadPlus();							// 仅载入默认插件

// 自定义文件类型，因为需要mime-type插件支持，所有必须等加载完插件之后
web.setMimes('cool', 'text/html');

var s = web.create(SERVER_PORT);

