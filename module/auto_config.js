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
	loadCustomConfig(cp);
	// 加载debug.json
	loadCustomDebug(cp);
	// 加载mimetype.json
	loadCustomMimetype(cp);
	// 加载render.json
	loadCustomRender(cp);
	// 加载link.json
	loadCustomLink(cp);
	// 加载error page
	loadCustomErrorPage(cp);
}

/** 关闭 */
exports.disable = function () {

}


var loadCustomConfig = function (cp) {
	var f = path.resolve(cp, 'config.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		web.loadConfig(f);
	}
}

var loadCustomDebug = function (cp) {
	var f = path.resolve(cp, 'debug.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		web.loadConfig(f);
	}
}

var loadCustomMimetype = function (cp) {
	var f = path.resolve(cp, 'mimetype.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json)
			web.mimetype.set(i, json[i]);
	}
}

var loadCustomRender = function (cp) {
	var f = path.resolve(cp, 'render.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json) {
			var r = require(json[i]);
			if (typeof r == 'function')
				web.render.add(i, r);
			else
				web.logger.warn(f + ' don\'t export a function');
		}
	}
}

var loadCustomLink = function (cp) {
	var f = path.resolve(cp, 'link.json');
	if (path.existsSync(f)) {
		web.log('auto config', f, 'info');
		var data = fs.readFileSync(f);
		var json = JSON.parse(data);
		for (var i in json) {
			for (var j in json[i])
				web.file.link(i, j, json[i][j]);
		}
	}
}

var loadCustomErrorPage = function () {
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