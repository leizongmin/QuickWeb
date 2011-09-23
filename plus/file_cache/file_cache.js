/**
 * 插件： 文件缓存
 * 
 * 可以通过web.file.load()来加载指定文件到内存中
 * 通过web.file.cache[filename]来访问该文件
 * 通过web.file.read()来读取文件，无需考虑是否在缓存
 * 设置参数file_cache_maxage表示文件缓存生存周期，单位为秒，默认为1天
 * 设置参数file_cache_recover表示缓存回收扫描周期，单位为秒，默认为10分钟
 */
 
var fs = require('fs');
var path = require('path'); 
 
exports.init_server = function (web, server) {

	/** 扩展web.file */
	web.file = {}
	
	/** 缓存了的文件 */
	var file_cache = web.file.cache = {}
	
	/**
	 * 缓存文件，以便下次打开时不需要再从硬盘中读取
	 *
	 * @param {string} filename 绝对文件名
	 * @param {bool} auto_update 当文件被修改时，是否自动更新缓存
	 */
	web.file.load = function(filename, auto_update) {
		if (typeof auto_update == 'undefined')
			auto_update = true;
		filename = path.resolve(filename);	
		
		try {
			var file = {}
			
			// 取得文件信息
			var stat = fs.statSync(filename);
			file.mtime = stat.mtime.toUTCString();	// 最后修改时间
			file.size = stat.size;					// 文件尺寸
			file.timestamp = -1;						// 缓存永不过期
			
			// 读取文件内容
			file.data = fs.readFileSync(filename);
			
			web.file.cache[filename] = file;
			web.log('cache file', filename + '  size: ' + stat.size + ', mtime: ' + file.mtime, 'info');
			
			// 检查是否自动更新
			if (auto_update) {
				fs.unwatchFile(filename);
				fs.watchFile(filename, function () {
					web.log('file cache', 'file has changed: ' + filename, 'debug');
					web.file.load(filename, true);
				});
				web.log('cache file', 'watch file: ' + filename, 'debug');
			}
		}
		catch (err) {
			web.log('cache file', err, 'error');
		}
	}
	
	/**
	 * 读文件代理，如果设置了参数cache_file，则会自动缓存该文件，在下次读取时不需要读磁盘
	 *
	 * @param {string} filename 文件名
	 * @param {function} callback 回调函数，格式：function (err, data)；与fs.readFile()相同
	 */
	web.file.read = function (filename, callback) {
		// 转换为绝对文件名
		var filename = path.resolve(filename);
		
		// 检查文件是否在缓存中
		if (filename in file_cache) {
			var file = file_cache[filename];
			web.log('read file from cache', filename, 'debug');
			// 如果是非永久缓存，则更新其时间戳
			if (file.timestamp >= 0)
				file.timestamp = new Date().getTime();
			// 返回数据
			callback(undefined, file.data);
			
			return;
		}
		
		// 文件不在缓存中，则从磁盘读取
		try {
			fs.readFile(filename, function (err, data) {
				if (err) {
					web.log('read file agent', err, 'error');
					callback(err, data);
				}
				else {
					web.log('read file from disk', filename, 'debug');
					// 保存到缓存中
					fs.stat(filename, function (err, stat) {
						if (err) {
							web.log('cache file', err, 'error');
							callback(err);
							return;
						}
						var file = {}
						file.mtime = new Date(stat.mtime).toUTCString();	// 文件最后修改时间
						file.size = stat.size;							// 文件尺寸
						file.timestamp = new Date().getTime();			// 时间戳
						file.data = data;								// 文件内容
						file_cache[filename] = file;
						
						// 返回数据
						callback(err, data);
					});
					// 如果文件修改了，则删除缓存
					fs.unwatchFile(filename);
					fs.watchFile(filename, function () {
						web.log('remove file cache', filename, 'debug');
						if (filename in file_cache)
							delete file_cache[filename];
					});
				}
			});
		}
		catch (err) {
			web.log('read file agent', err, 'error');
			callback(err);
		}
	}

	
	/** 缓存回收启动扫描 */
	var file_cache_maxage = web.get('file_cache_maxage');
	if (isNaN(file_cache_maxage))
		file_cache_maxage = 3600 * 24;
	file_cache_maxage *= 1000;
	var file_cache_recover = web.get('file_cache_recover');
	if (isNaN(file_cache_recover))
		file_cache_recover = 60 * 5;
	file_cache_recover *= 1000;
	
	setInterval(function () {
		web.log('file cache recover', 'start', 'debug');
		var timestamp = new Date().getTime();
		for (var i in file_cache) {
			if (file_cache[i].timestamp >= 0 && file_cache[i].timestamp + file_cache_maxage < timestamp) {
				web.log('remove file cache', i, 'debug');
				delete file_cache[i];
			}
		}
	}, file_cache_recover);
}