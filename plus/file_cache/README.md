# 文件缓存

## 载入缓存文件

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