# MIME-TYPE

## 获取MIME-TYPE

可以通过`web.mimes(extname)`或`ServerInstance.mimes(extname)`来获取指定扩展名的MIME-TYPE

```javascript
response.writeHead(200, {
	'Content-Type': server.mimes('html')
});
```


## 自定义MIME-TYPE

可以通过`web.setMimes(extname, mime_type)`或ServerInstance.setMimes(extname, mime_type)`
来设置自定义的MIME-TYPE（必须在`web.loadPlus()`之后设置）

```javascript
web.loadPlus(); // 先载入所有插件

web.setMimes('xxoo', 'application/xxoo');
```
