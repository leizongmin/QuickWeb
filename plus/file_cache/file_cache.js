/**
 * 插件： 文件缓存
 * 
 * 可以通过web.file.load()来加载指定文件到内存中
 * 通过web.file.cache[filename]来访问该文件
 */
 
var fs = require('fs');
var path = require('path'); 
 
exports.init_server = function (web, server) {

	/** 扩展web.file */
	web.file = {}
	
	/** 缓存了的文件 */
	web.file.cache = {}
	
	/**
	 * 缓存文件，以便下次打开时不需要再从硬盘中读取
	 *
	 * @param {string} filename 绝对文件名
	 * @param {bool} auto_update 当文件被修改时，是否自动更新缓存
	 */
	web.file.load = function(filename, auto_update) {
		if (typeof auto_update == 'undefined')
			auto_update = true;
		var home_path = web.get('home_path');
		filename = path.resolve((home_path ? home_path : '.'), filename);	
		
		try {
			var file = {}
			
			// 取得文件信息
			var stat = fs.statSync(filename);
			file.mtime = stat.mtime.toUTCString();	// 最后修改时间
			file.size = stat.size;					// 文件尺寸
			
			// 读取文件内容
			file.data = fs.readFileSync(filename);
			
			web.file.cache[filename] = file;
			web.log('file cache', filename + '  size: ' + stat.size + ', mtime: ' + file.mtime, 'info');
			
			// 检查是否自动更新
			if (auto_update) {
				fs.unwatchFile(filename);
				fs.watchFile(filename, function () {
					web.log('file cache', 'file has changed: ' + filename, 'debug');
					web.file.load(filename, true);
				});
				web.log('file cache', 'watch file: ' + filename, 'debug');
			}
		}
		catch (err) {
			web.log('file cache', err, 'error');
		}
	}

}