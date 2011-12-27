/**
 * QuickWeb auto config
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;

var fs = require('fs');
var path = require('path');

/** 初始化 */
exports.init = function () {

}

/** 开启 */
exports.enable = function () {
	var cp = path.resolve(web.get('config path'));;
	try {
		var s = fs.statSync(cp);
		if (!s.isDirectory()) {
			web.log('auto config', 'cannot find config path: ' + cp, 'warn');
			return;
		}
	}
	catch (err) {
		web.log('auto config', 'cannot find config path: ' + err, 'warn');
		return;
	}
	
	// 加载config.json
	loadCustomConfig(cp, true);
	// 加载debug.json
	loadCustomDebug(cp, true);
	// 加载mimetype.json
	loadCustomMimetype(cp, true);
	// 加载render.json
	loadCustomRender(cp, true);
	// 加载link.json
	loadCustomLink(cp, true);
	// 加载error page
	loadCustomErrorPage(true);
}

/** 关闭 */
exports.disable = function () {

}


var loadCustomConfig = function (cp, auto_update) {
	var f = path.resolve(cp, 'config.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		web.loadConfig(f, auto_update);
	}
}

var loadCustomDebug = function (cp, auto_update) {
	var f = path.resolve(cp, 'debug.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		web.loadConfig(f, auto_update);
	}
}

var loadCustomMimetype = function (cp, auto_update) {
	var f = path.resolve(cp, 'mimetype.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json)
			web.mimetype.set(i, json[i]);
			
		// 自动更新
		if (auto_update === true) {
			fs.watchFile(f, function () {
				try {
					loadCustomMimetype(cp, false);
				}
				catch (err) {
					web.logger.error(err);
				}
			});
		}
	}
}

var loadCustomRender = function (cp, auto_update) {
	var f = path.resolve(cp, 'render.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json) {
			// 判断是模块名还是文件名
			switch (json[i].charAt(0)) {
				case '.':
				case '/':
					var r = require(path.resolve(__dirname, '..', json[i]));
					break;
				default:
					var r = require(json[i]);
			}
			// 如果是函数，则直接作为渲染函数
			if (typeof r == 'function')
				web.render.add(i, r);
			// 如果是对象，则检查是否有to_html函数或者compile函数、render函数
			else if (typeof r == 'object') {
				// Mustache模板的to_html()
				if (typeof r.to_html == 'function')
					web.render.add(i, r.to_html);
				// jade模板的render函数
				else if (typeof r.render == 'function')
					web.render.add(i, r.render);
				// jade模板的compile函数
				else if (typeof r.compile == 'function')
					web.render.add(i, function (text, data) {
						return r.compile(text)(data);
					});
				else
					web.logger.warn(f + ' don\'t export a to_html/compile/render function');
			}
			else
				web.logger.warn(f + ' don\'t export a function');
		}
		
		// 自动更新
		if (auto_update === true) {
			fs.watchFile(f, function () {
				try {
					loadCustomRender(cp, false);
				}
				catch (err) {
					web.logger.error(err);
				}
			});
		}
	}
}

var loadCustomLink = function (cp, auto_update) {
	var f = path.resolve(cp, 'link.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json) {
			for (var j in json[i])
				web.file.link(i, j, json[i][j]);
		}
		
		// 自动更新
		if (auto_update === true) {
			fs.watchFile(f, function () {
				try {
					loadCustomLink(cp, false);
				}
				catch (err) {
					web.logger.error(err);
				}
			});
		}
	}
}

var loadCustomErrorPage = function (auto_update) {
	var p = web.get('error page path');
	p = path.resolve(p);
	if (path.existsSync(p)) {
		var dir = fs.readdirSync(p);
		for (var i in dir) {
			var f = dir[i];
			if (path.extname(f) == '.html') {
				var c = f.substr(0, f.length - 5);
				web.set('error page ' + c, path.resolve(p, f));
			}
		}
	}
}