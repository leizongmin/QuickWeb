/**
 * QuickWeb app manager
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.11
 */
 
/**
 * 文件代理
 * 
 * 可以通过web.file.load()来加载指定文件到内存中
 * 通过web.file.cache[filename]来访问该文件
 * 通过web.file.read()来读取文件，无需考虑是否在缓存
 * 设置参数file_cache_maxage表示文件缓存生存周期，单位为秒，默认为1小时
 * 设置参数file_cache_recover表示缓存回收扫描周期，单位为秒，默认为10分钟
 */
 
var web = require('./web'); 
var fs = require('fs');
var path = require('path'); 
 

/** 扩展web.file */
web.file = {}
	
/** 缓存了的文件 */
var file_cache = web.file.cache = {}
	
/**
 * 获取实际文件名
 *
 * @param {string} filename 文件名
 * @return {string} 
 */
web.file.resolve = function (filename) {
	// 转换为实际文件名
	var _dirlink = web._dirlink;
	var fnl = filename.length;
	var checkfilename;
	for (var i in _dirlink) {
		// web.log('virtual path check', filename + '    ' + i, 'debug');
		var il = i.length;
		if (fnl < il)
			checkfilename = filename + '/';
		else
			checkfilename = filename;
		if (checkfilename.substr(0, i.length) == i) {
			var oldfilename = filename;
			filename = _dirlink[i] + filename.substr(i.length);
			web.log('virtual path convert', oldfilename + '  =>  ' + filename, 'debug');
			break;
		}
	}
	// 返回文件名
	return filename;
}
	
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
 * @param {function} callback 回调函数，格式：function (err, data, default_file_name)；与fs.readFile()相同
 * 							如果使用了默认文件名，则设置第三个参数为该文件名
 */
web.file.read = function (filename, callback) {
		
	// 检查文件是否在缓存中
	if (filename in file_cache) {
		var file = file_cache[filename];
		web.log('read file from cache', filename, 'debug');
		// 如果是非永久缓存，则更新其时间戳
		if (file.timestamp >= 0)
			file.timestamp = new Date().getTime();
		// 返回数据
		callback(undefined, file.data, file.default_file);
		
		return;
	}
		
	// 文件不在缓存中，则从磁盘读取
	var readfile = function (_default_file) {
		try {
			/* 读取文件回调函数 */
			var readfile_handler = function (err, data) {
				if (err) {
					// 如果是一个目录，则自动加上默认文件名
					if (err.toString().indexOf('EISDIR') >= 0) {
						web.log('read file agent', filename + ' is a dir, read default page', 'info');
						// 默认为index.html
						readfile(web.get('default_file') || 'index.html');
					}
					else {
						web.log('read file agent', err, 'error');
						callback(err);
					}
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
						file.default_file = _default_file;				// 默认文件名
						// 如果文件太大，则不缓存（默认最大为2M）
						if (file.size <= 2097152)
							file_cache[filename] = file;
						
						// 返回数据
						callback(err, data, _default_file);
					});
						
					// 如果文件修改了，则删除缓存
					watchfile();
				}
			}
			
			/* 监视文件改动回调函数 */
			var watchfile = function () {
				// 生成实际文件名
				if (typeof _default_file == 'undefined')
					var _fn = filename;
				else
					var _fn = path.resolve(filename, _default_file);
					
				// 监视时间文件名
				fs.unwatchFile(_fn);
				fs.watchFile(_fn, function () {
					web.log('remove file cache', _fn, 'debug');
					// 在缓存中的为目录名
					if (filename in file_cache)
						delete file_cache[filename];
				});
			}
			
			// 如果是一个目录，在自动加上默认文件名后，为了保证每次读取该文件时，不需要重新判断，此处
			// 保存在缓存中的文件名是该目录名
			if (typeof _default_file == 'undefined')
				fs.readFile(filename, readfile_handler);
			else
				fs.readFile(path.resolve(filename, _default_file), readfile_handler);
		}
		catch (err) {
			web.log('read file agent', err, 'error');
			callback(err);
		}
	}
	readfile();
}

	
/** 缓存回收启动扫描 */
var file_cache_maxage = web.get('file_cache_maxage');
if (isNaN(file_cache_maxage))
	file_cache_maxage = 3600;
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
