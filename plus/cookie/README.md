# Cookie插件

+ **读取Cookie** 可以通过`ServerRequest.cookie`来访问该次请求的Cookie

```javascript
for (var i in request.cookie)
	response.write('Cookie  ' + i + ' = ' + request.cookie[i];
```


+ **设置Cookie** 可以通过`ServerResponse.setCookie('name', 'value', options)`
来设置Cookie

```javascript
response.setCookie('key', 'fhdkjshjkhgjkhfkj', {
	path: 	'/',	// Cookie路径，可选
	maxAge: 3600,	// 有效期，指从当前时刻起Cookie存活的秒数，如果指定了expires，则相加
	expires: new Date('2011/12/31'),	// Cookie有效期，maxAge和expires至少指定一个
	domain:	'xxx.com',	// 域名，可选
	sercure: true
});
```


+ **清除Cookie** 可以通过`ServerResponse.clearCookie(name, [options])`来清除Cookie

```javascript
response.clearCookie('key', {
	path: 	'/',
	domain:	'xxx.com'
});
```