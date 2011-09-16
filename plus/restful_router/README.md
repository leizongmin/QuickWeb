# REST样式路由

## 设置

需要设置参数**code_path**为处理程序的目录

```javascript
web.set('code_path', './code');
```


## 说明

在载入该插件时，或扫描**code_path**目录下的所有.js文件，并尝试作为模块加载它。
如果该模块输出了字符串类型的paths属性，则以paths的值作为REST路径进行注册，并搜索
该模块中输出的函数get、post、delete、put、head作为针对该paths对应请求方法的处理
程序。

如果为诸如`/:path1/:path2`之类以斜杠和冒号开头的转移字符后面跟path标识符的
路径文本，插件会自动匹配如`/username/filename`指令的请求路径，并设置
`ServerRequest.path`为匹配的值。

```javascript
exports.paths = '/:year/:month/:day';

/* GET 方法处理程序 */
exports.get = function (server, request, response) {
	response.end('Year: ' + request.path.year +
				 'Month: ' + request.path.month +
				 'Day:   ' + request.path.day
				);
}

/* POST 方法处理程序 */
exports.post = function (server, request, response) {
	// ...
}
