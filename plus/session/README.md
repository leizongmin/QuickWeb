# SESSION

## 设置

需要设置参数**session_maxage**为session的存活时间，单位为毫秒，默认为10分钟
（当客户端在超过指定时候没有活动时，则删除该session）

设置参数**session_recover**为Session回收的扫描周期，单位为毫秒，默认为1分钟


## 开启Session

可以通过`ServerInstance.sessionStart()`来开启Session。在每次请求处理中，必须
调用该方法，然后才能访问Session数据。如果注册了第三方session，则应该设置一个
回调函数。

```javascript
	server.sessionStart(function () {
		// session初始化完成，可以通过server.session来访问session数据
		// 或者server.sessionObject来访问SessionObject实例
	});
```


## 访问Session数据

可以通过`ServerInstance.session`来访问session数据

```javascript
	for (var i in server.session)
		response.write('Session   ' + i + ' = ' + server.session[i]);
```


## 清空Session数据

可以通过`ServerInstance.clearSession`来情况当前客户端的Session数据

```javascript
	server.clearSession();
```


## 更新Session数据

默认情况下，QuickWeb的Session是存储在内存中的，因此你对server.session的修改会自动
保存起来。如果注册了自己的Session存储方式，则需要调用`server.sessionObject.update()`来
完成更新。

```javascript
server.sessionObject.update(function () {
	// 更新完成
});
```


## 通过cookie字符串访问Session

如果程序无法访问ServerRequest实例（如在socket.io程序里面），可以通过客户端的cookie字符串来获取其对应的session数据

```javascript
	var session = web.session.getByCookie(request.headers.cookie);
```


## 通过session_id来访问session

如果程序无法访问ServerRequest实例（如在socket.io程序里面），可以通过客户端的cookie字符串来获取其对应的session数据

```javascript
	var session = web.session.get(session_id);
```
