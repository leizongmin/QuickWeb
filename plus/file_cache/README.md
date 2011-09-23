# 文件缓存

## 设置

* 参数**file_cache_maxage**表示文件缓存的存活时间，单位为秒（只针对不是web.file.load()载入的文件有效），默认为1天

* 参数**file_cache_recover**表示缓存回收的扫描周期，单位为秒，默认为10分钟


## 使用代理函数读取文件

通过**web.file.read()**来代替fs.readFile()可以自动缓存文件，例：
```javascript
	web.file.read(filename, function (err, data) {
		if (err)
			console.log('读取文件出错');
		else
			console.log('文件内容：' + data);
	});
```


## 载入固定缓存文件

通过**web.file.load()**来将文件缓存到内存中。例：

```javascript
	// 缓存文件，当文件被更改后，自动更新缓存
	web.file.load('./www/index.html');
	
	// 缓存文件，当文件被更改后，不自动更新缓存
	web.file.load('./www/test.html', false);
```


## 访问缓存文件

可以通过**web.file.cache**来访问被缓存的文件。例：

```javascript
	if (filename in web.file.cache) {
		var file = web.file.cache[filename];	// 取得缓存文件对象
		console.log('文件最后修改时间：' + file.mtime);
		console.log('文件尺寸：' + file.size);
		console.log('文件内容：' + file.data);
	}
```