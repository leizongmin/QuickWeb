# SESSION

## 设置

需要设置参数**session_maxage**为session的存活时间，单位为毫秒，默认为10分钟
（当客户端在超过指定时候没有活动时，则删除该session）

设置参数**session_recover**为Session回收的扫描周期，单位为毫秒，默认为1分钟


## 开启Session

可以通过`ServerInstance.sessionStart()`来开启Session。在每次请求处理中，必须
调用该方法，然后才能访问Session数据

```javascript
server.sessionStart();
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
