# QuickWeb [Web框架中的中国军铲](http://video.baidu.com/v?ct=301989888&rn=20&pn=0&db=0&s=8&word=%D6%D0%B9%FA%BE%FC%B2%F9&fr=ala0)

## 安装

	npm install QuickWeb

或者

	git clone git://github.com/leizongmin/QuickWeb.git
	npm install formidable
	npm install mustache


## 测试地址：<http://quick.cnodejs.net/>


## QuickWeb的“简单化部署”

所有处理程序都放在相应独立的文件里，系统可以像搭积木一样任意增删各
种功能，这才是QuickWeb所理解的“简单”。

QuickWeb的核心只封装了Nodejs内置模块中的http.Server、http.ServerRequest、
http.ServerResponse，以及一个简单的插件管理器，它要处理HTTP请求必须
依靠加载的各种插件来完成。比如cookie，session，router，POST数据解析
等等这些功能都需要相应的插件。

以下是一个最基本的QuickWeb启动代码：

```javascript
	var web = require('./core/web');
	
	// 启动服务器
	var s = web.create(80);
```

## 插件的加载

在启动服务器时，你需要执行web.loadPlus(PLUS_PATH)来扫描插件包并加载。
插件通过package.json文件来描述，其格式如下：

```javascript
	{
		"name":			"file_server",
		"main":			"./file.js",
		"sequence":		"last",
		"dependencies":	{
			"get":	"*"
		}
	}
```

+ **name**：插件的名称
+ **main**：插件的主文件
+ **sequence**：加载顺序，可以为front(最前面)、last(最后面)、或者留空
+ **dependencies**：依赖关系，如果该插件需要依赖另外的插件，则在此说明

执行web.loadPlus()时，系统会自动根据插件package.json文件所指定的加载顺序
及依赖关系自动调整其加载顺序。如果没有找到插件所依赖的其他插件，则报错。


## 插件的编写

以下是解析GET参数的插件主要的代码：

```javascript
	var url = require('url'); 
 
	exports.init_request = function (web, request, debug) {
		request.addListener(function (req) {
			var v = url.parse(req.url, true);
			req.get = v.query || {};				// 问号后面的参数
			req.filename = v.pathname || '/';		// 文件名
			
			req.next();
		}, true);
	}
```

插件需要注册到那个对象上，是通过其输出的函数来确定的。如输出**init_request**表示需要注册到
request对象上，相应地，注册到response对象需要输出**init_response**，注册到server对象需要输出
**init_server**。

init_request函数接收三个参数：

+ **web** QuickWeb对象，可以通过它来获取系统配置信息
+ **request** request对象，通过他来完成注册功能
+ **debug** 调试输出函数


### 注册处理链

处理链的运行方式跟Nodejs的事件是差不多的，但是注册到处理链中的处理函数是按照一定的顺序
来运行的，必须在当前的处理函数处理完毕，并调用对象的`.next()`方法来通知下一个处理函数运行，
或者通过`.onready()`方法来提前结束（忽略剩下的处理函数）。

注册处理链通过被注册对象的**addListener**方法来进行，以request为例：

```javascript
	request.addListener(function (req) {
		// 处理代码
		req.next();
	});
```

注册到处理链中的函数会在每次新请求开始时运行，相当于整个请求过程中的初始化阶段。处理函数
接收一个参数，即当前的ServerRequest实例。如上例中的代码：

```javascript
	var v = url.parse(req.url, true);
	req.get = v.query || {};				// 问号后面的参数
	req.filename = v.pathname || '/';	// 文件名
```

该插件运行完毕之后，会为该ServerRequest实例增加了两个属性：

+ **get** 请求的GET参数
+ **filename** 请求的文件名，即URL中?前面部分，可以为后面的router和file插件提供信息


### 注册静态方法

比如Web.js中，response对象有cookie、clearCookie、sendJSON、sendFile这些方法，在QuickWeb
中是通过注册静态方法来完成的。以下是一个注册sendJSON方法的例子：

```javascript
	/**
	 * 发送JSON数据
	 *
	 * @param {object} data
	 */
	response.ServerResponse.prototype.sendJSON = function (data) {
		try {
			var json = JSON.stringify(data);
			this.end(json.toString());
		}
		catch (err) {
			debug(err);
			this.writeHead(500);
			this.end(err.toString());
		}
	}
```

其原理是：在ServerResponse对象的原型中增加一个sendJSON方法，在实际运行时，就可以通过this来
访问当前的ServerRequest实例。


### 高级功能

在注册的静态方法里面，可以通过this._link来访问当前请求的ServerInstance、ServerRequest、
ServerResponse实例，如session插件中的代码如下：

```javascript
	request.ServerInstance.prototype.sessionStart = function () {
		// 必须要有Cookie模块的支持
		if (typeof this._link.request.cookie == 'undefined') {
			debug('sessionStart error: cookie disable!');
			return;
		}
			
		// 如果为首次打开SESSION
		if (typeof this._link.request.cookie._session_id == 'undefined') {
			var session_id = new Date().getTime() * 100000 + Math.floor(Math.random() * 100000);
			session_data[session_id] = {data: {} }
			this._link.response.setCookie('_session_id', session_id, { maxAge: 3600 });
			this._link.request.cookie._session_id = session_id;
		}
		else {
			var session_id = this._link.request.cookie._session_id;
		}
			
		// 如果没有该SESSION ID，则初始化
		if (typeof session_data[session_id] == 'undefined') {
			session_data[session_id] = {data: {} }
		}
			
		this.session = session_data[session_id].data;
		session_data[session_id].timestamp = new Date().getTime();
	}
```


## 内置的插件

### Cookie

加载Cookie插件之后，可以通过`request.cookie`来获取Cookie，通过`response.setCookie()`和`response.clearCookie()`
来设置或清除Cookie。

**Cookie插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/cookie>

=====

### GET

加载Get插件之后，可以通过`request.get`来获取?后面的CET参数，以及`request.filename`来获取?前面部分。

**Get插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/get>

=====

### POST

加载POST插件之后，如果请求的方法为POST，则可以通过`request.post`来获取提交的POST参数，以及`request.file`来
获取上传上来的文件。

**POST插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/post>

=====

### Response_send

加载Response插件之后，可以通过`response.sendJSON()`，`response.sendFile()`来简化返回数据操作。

**response_send插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/response_send>

=====

### mime-type

加载mime-type插件之后，可以通过`web.mimes()`，`web.setMimes()`来查询或自定义文件的MIME-TYPE

**mime-type插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/mime-type>

=====

### file_server

加载file_server插件之后，在启动QuickWeb服务器前，通过`web.set('home_path', '网站目录')`来设置网站的目录，
当其他插件无法处理某一请求时，会尝试检查request.filename是否为网站目录下的一个文件，并返回相应的
结果。

**静态文件服务插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/file_server>

=====

### session

加载session插件之后，可以通过`server.sessionStart()`来开启session，并通过`server.session`来
访问session数据。可以通过`web.set('session_maxage', 'session存活时间ms')`，
`web.set('session_recover', '回收扫描周期ms')`来进行设置。

**session插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/session>

=====

### render

加载render插件之后，可以通过`server.render()`或`server.renderFile()`来使用mustache引擎渲染模板。
可以通过`web.set('template_path', '模板目录')`来设置模板所在目录。
可以通过`web.set('render_to_html, 渲染函数)`来设置渲染函数，不限制使用任何模板引擎

**render插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/render>

**[使用其他模板引擎](#use_other_render)**

=====

### RESTful_router

加载router插件之后，在启动QuickWeb服务器前，通过`web.set('code_path', '程序目录')`来设置你的处理程序
所在的目录。在QuickWeb初始化新请求中的ServerRequest，ServerResponse实例后，将控制权交给router时，它会
尝试匹配你注册的路径处理程序，如果匹配成功，则执行你注册的代码。（后面将详细介绍）

**restful_router插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/restful_router>

=====

### response_pipe

加载respones_pipe插件之后，可以通过`response.pipe()`来简化在一次请求中分批渲染网页，类似于
**BigPipe**

**response_pipe插件说明** <https://github.com/leizongmin/QuickWeb/tree/master/plus/response_pipe>

=====


## 路由及处理程序

路由功能需要加载router插件才能使用。
在启动QuickWeb时，需要设置一个名为'code_path'的属性来指示处理程序所在的目录。加载router插件时，它会
扫描code_path目录下的.js文件，并尝试加载它。以下是一个简单的示例代码：

```javascript
	exports.paths = '/:username/:filename';

	exports.get = function (server, request, response) {
		var html = '';
		for (var i in request.path)
			html += i + ' = ' + request.path[i] + '\n';
		response.end(html);
	}
```

在模块中，通过输出字符串类型paths来说明其要匹配的请求路径，然后输出相应的get、post、delete、put、head
函数来注册对应的请求方法。

处理程序接收三个参数，分别为server、request、response：

+ **server** 可以通过server来访问服务器的全局信息
+ **request** 当前请求的request实例
+ **response** 当前请求的response实例

可以通过`request.path`来访问匹配的PATH数据，如上例代码，如果访问的路径为“/lei/hello”，则匹配后
`request.path.username = 'lei'`，`request.path.filename = 'hello'`


<a name="use_other_render">

## 使用其他模板引擎

**QuickWeb**默认不使用任何的模板引擎，因此你调用`server.render()` 或`server.renderFile()`时，只是简单地
返回原来的模板内容，如果想加入要使用的模板引擎，可以通过设置**render_to_html**参数来实现：

```javascript
	// 定义模板渲染函数
	var mustache = require('mustache');
	web.set('render_to_html', function (str, view) {
		return mustache.to_html(str, view);
	});
```
