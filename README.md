# QuickWeb

## 安装

	npm install QuickWeb

或者

	git clone git://github.com/leizongmin/QuickWeb.git
	npm install formidable


## 测试地址：<http://quick.cnodejs.net/>


## 简单化部署

### 1.创建服务器

安装后QuickWeb后，在你的程序目录中新建一个js文件，比如"start.js"，然后加入以下代码：

```javascript
	// 载入QuickWeb
	var web = require('QuickWeb');
	// 创建服务器，监听80端口
	web.create();
```

在当前目录下创建目录**html**用于存放你的静态文件，**code**目录用于存放路由处理程序，以及
**tpl**目录用于存放模板文件。

当别人访问你的网站时，所有的静态文件都是从目录**html**里面查找的；

程序目录为**./code**，网站服务器端的处理程序将放在这个目录里面。

如果要手动指定这些目录，可以在web.create()语句前使用**web.set('参数名', '值')**来指定：

```javascript
	// 设置
	web.set('home_path', './html');			// 网站根目录
	web.set('code_path', './code');			// 程序目录
	web.set('template_path', './tpl');			// 模板目录
```

或者

```javascript
	// 也可以这样设置
	web.set({
		home_path:		'./html',
		code_path:		'./code',
		template_path:	'./tpl'
	});
```

如果要创建HTTPS服务器，则使用以下语句：

```javascript
	web.createHttps({
		key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),		// 设置证书
		cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
	}, 443);
```


### 2.编写程序

在**./code**目录中新建一个js文件，比如“index.js”，然后输入以下代码：

```javascript
	// 注册路径'/'
	exports.paths = '/';
	
	// GET请求的处理程序
	exports.get = function (server, request, response) {
		response.end('Hello, world!');	// 输出"Hello, world!"并结束
	}
```

运行start.js，打开网址<http://localhost/>，你将会看到页面"**Hello, world!**"


### 3.调试输出

默认情况下，QuickWeb会输出所有调试信息，这会影响程序的运行效率。在启动QuickWeb实例时，可以
通过**web.setLogLevel()**来设置调试输出等级：

```javascript
	// 设置输出等级， 0:不输出  1:仅输出error   2:仅输出error和info   3:输出所有信息
	web.setLogLevel(1);
```


## 注册路由处理程序

在启动QuickWeb时，会自动扫描**code_path**目录下的js文件，并尝试加载它：

* 该js文件必须是标准的nodejs模块，必须输出字符串类型paths属性，表示要注册的路径，如："**/home**"、"**/**"。
还可以使用REST样式的路径，如："**/user/:userid**"、"**/:city**"；

* 必须输出相应请求方法的处理函数。QuickWeb支持**GET**、**POST**、**PUT**、**DELETE**、**HEAD**共5种请求方法，
比如要注册GET方法的处理函数，则输出 `exports.get = function (server, request, response) { }` ；

* 每个文件只能注册一个路径，但是可以注册多个请求方法；

例：

```javascript
	exports.paths = '/user/:filename';
	// 读取文件
	exports.get = function (server, request, response) {
		response.sendFile(request.path.filename);
	}
	// 删除文件
	exports.delete = function (server, request, response) {
		err = fs.unlinkSync(request.path.filename);
		response.end(err ? err : '成功！');
	}
```

### 1.路由处理程序的编程环境

每个请求处理函数都接收3个参数，依次为**server**、**request**、**response**：

* **server**是**ServerInstance**的实例，可以通过它来进行一些公共的操作；

* **request**是**ServerRequest**的实例，可以通过它来获取客户端提交的参数等；

* **response**是**ServerResponse**的实例，可以通过它来完成对本次请求的响应；

### 2.使用GET参数和POST参数

在每个处理函数内，可以通过**request.get**来获取GET参数（即URL中问号后面的参数）；如果是POST请求，
还可以通过**request.post**来获取POST提交的参数。例：

```javascript
	exports.paths = '/search';
	exports.get = function (server, request, response) {
		var kw = request.get.keyword;
		var type = request.get.type;
		// ... 其他程序 ...
	}
```

```javascript
	exports.paths = '/login';
	exports.post = function (server, request, response) {
		var username = request.post.username;
		var password = request.post.password;
		// ... 其他程序 ...
	}
```

### 3.上传文件处理

如果客户端通过POST请求提交了文件，可以通过**request.file**来获取上传上来的文件。
每个文件参数包含5个属性：
**size**文件尺寸、**path**临时文件名、**name**文件名称、**type**文件类型、**lastModifiedDate**最后修改时间。
上传上来的文件被保存到临时目录里面，可以通过path属性来获取其临时文件名称，并读取其内容。
例：

```javascript
	exports.paths = '/upload';
	exports.post = function (server, request, response) {
		for (var i in request.file) {
			response.write('文件尺寸：' + request.file[i].size);
			response.write('临时文件名：' + request.file[i].path);	// 通过临时文件名来读取该文件
			response.write('名称：' + request.file[i].name);
			response.write('类型：' + request.file[i].type);
			response.write('最后修改时间：' + request.file[i].lastModifiedDate);
		}
	}
```

### 4.使用Cookie

在每个处理函数内，可以通过**request.cookie**来访问Cookie数据。
通过**response.setCookie()**及**response.clearCookie()**来操作Cookie。
例：

```javascript
	exports.paths = '/cookie-example';
	exports.get = function (server, request, response) {
		var username = request.cookie.username;
		// ...其他程序 ...
	}
```

```javascript
	exports.paths = '/cookie-example2';
	exports.get = function (server, request, response) {
		response.setCookie('名称', '值', {
			path: 	'/',		// Cookie路径，可选
			maxAge: 3600,	// 有效期，指从当前时刻起Cookie存活的秒数，如果指定了expires，则相加
			expires: new Date('2011/12/31'),	// Cookie有效期，maxAge和expires至少指定一个
			domain:	'xxx.com',	// 域名，可选
			sercure: true			// 可选
		});
	}
```

```javascript
	exports.paths = '/cookie-example3';
	exports.get = function (server, request, response) {
		response.clearCookie('名称', {
			path: 	'/',				// 选项同setCookie()
			domain:	'xxx.com'
		});
	}
```

### 5.使用Session

在每个处理函数内，可以通过**server.sessionStart()**来开启session，然后就可以通过**server.session**来
访问session数据。例：

```javascript
	exports.paths = '/session-example';
	exports.get = function (server, request, response) {
		server.sessionStart();
		// 获取session
		var username = server.session.username;
		
		// 设置session
		server.session.username = 'new';
		
		// ... 其他程序 ...
	}
```

### 6.返回处理结果

在每个处理函数内，可以通过**response.write()**和**response.end()**来返回处理结果。

* **response.write()**向客户端输出数据，仍然保持连接

* **response.end()**向客户端输出数据，并关闭连接

例：

```javascript
	exports.paths = '/example';
	exports.get = function (server, request, response) {
		for (var i = 0; i < 10; i++)
			response.write('i=' + i);		// 循环输出，但不关闭连接
			
		response.end('没有了！');			// 输出数据，并关闭连接
	}
```

### 7.设置响应头

在调用response.write()或response.end()之前，还可以通过**response.setHeader()**和
**response.writeHead()**来设置响应头。例：

* **response.setHeader()**设置响应头，必须在response.writeHead()前调用

* **response.writeHead()**输出响应头，必须在输出数据前调用

```javascript
	exports.paths = '/example';
	exports.get = function (server, request, response) {
		// 设置响应头
		response.setHeader('header-1', '自定义header');
		// ... 其他程序 ...
	}
```

```javascript
	exports.paths = '/example';
	exports.get = function (server, request, response) {
		// 输出响应头
		response.writeHead(200, {
			'header-1': '自定义header',
			'header-2': '自定义header'
			});
		// ...其他程序 ...
	}
```

### 8.返回JSON数据

在每个处理函数内，可以通过**response.sendJSON()**来返回JSON格式的数据，以简化操作。
例：

```javascript
	exports.paths = '/example-json';
	exports.get = function (server, request, response) {
		// 返回JSON格式结果，并关闭连接
		response.sendJSON({name: '老雷', cool: true});
	}
```

### 9.发送文件

在每个处理函数内，可以通过**response.sendFile()**来返回一个文件(以**www_path**为根目录）例：

```javascript
	exports.paths = '/example-file';
	exports.get = function (server, request, response) {
		// 返回一个文件，并关闭连接
		response.sendFile('index.html');
	}
```

### 10.重定向

在每个处理函数内，可以通过**response.redirect()**来重定向当前请求。例：

```javascript
	exports.paths = '/example-redirect';
	exports.get = function (server, request, response) {
		// 重定向
		response.redirect('/home');
	}
```

### 11.404错误页面

如果要自定义404错误页面，可以在启动QuickWeb实例前设置参数**page_404**来完成：

```javascript
	var fs = require('fs');
	web.set('page_404', fs.readFileSync('404.html'));	// 直接设置成HTML代码，而不是文件名
```

### 12.自定义文件MIME类型

如果需要加入自定义文件MIME类型，可以在启动QuickWeb实例后通过**web.setMimes()**来完成：

```javascript
	// 先创建Http服务器
	web.create();
	// 在设置文件MIME类型
	web.setMimes('cool', 'text/html');
```

=====

**示例程序可看这里**：<https://github.com/leizongmin/QuickWeb/tree/master/examples/default>


## 高级功能

### 1.使用模板引擎

默认情况下，QuickWeb没有加载任何模板引擎，可以通过以下步骤来注册模板引擎：

* 在启动QuickWeb服务器前，设置参数**template_path**为模板文件所在的目录；

* 同时注册模板处理函数，通过设置参数**render_to_html**来完成：模板处理函数接收两个
参数：**str**和**view**，str为**模板内容**，view为**视图**（即用于渲染模板的数据），处理函数
处理后的结果；

* 可以通过设置参数**template_extname**为模板文件默认的扩展名，以简化操作；

例：

```javascript
	// 模板目录 ./tpl
	web.set('template_path', './tpl');
	// 模板文件默认扩展名 .html
	web.set('template_extname', 'html');
	// 定义模板渲染函数
	var mustache = require('mustache');
	web.set('render_to_html', function (str, view) {
		// 使用mustache模板引擎来完成渲染
		return mustache.to_html(str, view);
	});
```

在注册完模板引擎之后，可以通过**response.render()**来渲染模板字符串，或者通过
**response.renderFile()**来渲染模板文件并返回结果给客户端。
例：

```javascript
	exports.paths = '/example-render';
	exports.get = function (server, request, response) {
		// 渲染字符串
		var html = response.render('{{name}}，你好！', {name: '老雷'});
		// ... 其他程序 ...
	}
```

```javascript
	exports.paths = '/example-renderFile';
	exports.get = function (server, request, response) {
		// 渲染文件并关闭连接
		response.renderFile('users', {name: '老雷'}, 'text/html');
	}
```

=====

### 2.自定义Session引擎

默认情况下，QuickWeb使用的Session将数据存储在本机的内存里，只能由本实例的程序访问。
如果你的程序需要在多个QuickWeb实例上共享Session数据，可以通过SessionObject提供
的接口来完成：

* 设置参数**session_pull**为获取Session数据的初始化函数

* 设置参数**session_update**为更新Session数据到Session引擎的处理函数

* 设置参数**session_free**为Session过期后释放Session数据的处理函数

* 设置参数**session_hold**为刷新Session时间戳的处理函数

在使用自定义的Session引擎时，当程序调用server.sessionStart()后，QuickWeb实际上是通过注册的**session_pull**函数
来获取Session数据，然后映射到内存里面。当程序对Session进行了修改，需要调用server.sessionObject.update()来
内存里面的Session数据通过**session_update**注册的处理函数来更新到自定义的Session引擎。

注册的session_pull、session_update、session_free处理函数均接收一个参数（有时候没有回调函数），用作回调函数。
在处理函数里面：

* 通过**this.id**来获取当前Session id；

* 通过**this.data**来获取射到内存中的Session数据；

* 通过**this.fill()**来将Session数据映射到内存中；

* 通过**this.timestamp**来获取或设置最后一次访问session的时间戳（此时间戳决定Session什么时候被回收）;

* 通过**this.callback()**来调用回调函数（表示该次处理完毕）

例：

```javascript
	// 自定义Session引擎处理函数
	// 连接MongoDB数据库
	var CustomSession = require('./config').db.collection('session');

	/** 获取数据 */
	web.set('session_pull', function (callback) {
		debug('session_pull');
		var self = this;
		// 从数据库中查找指定ID的Session数据
		CustomSession.findOne({_id: self.id}, function (err, d) {
			if (err)
				console.log(err);
			if (!d)
				d = {data: {}}
			// 通过SessionObject.fill()来设置Session数据
			self.fill(d.data || {});
			// 通过SessionObject.callback()来调用回调函数及处理结果（可选）
			self.callback(callback, true);
		});
	});

	/** 更新数据 */
	web.set('session_update', function (callback) {
		debug('session_update');
		var self = this;
		debug(self);
		// 保存Session数据到数据库中，通过SessionObject.data来获取内存映射中的数据
		CustomSession.save({_id: self.id, data: self.data, timestamp: new Date().getTime()}, function (err) {
			if (err)
				console.log(err);
			self.callback(callback, err ? false : true);
		});
	});

	/** 释放数据 */
	web.set('session_free', function (callback) {
		debug('session_free');
		var self = this;
		// 从数据库中删除指定的Session数据，一般由Session回收管理器来自动调用
		// 对于多个Web实例共享Session的应用，因为此回收机制仅针对当前QuickWeb实例的
		// 为了避免误删除数据，在删除前最后判断一下其他Web实例最后从数据库访问此Sesison
		// 的时间，以确定是否真的过期了
		CustomSession.remove({_id: self.id}, function (err) {
			if (err)
				console.log(err);
			self.callback(callback, err ? false : true);
		});
	});
```

由于定义的Session引擎一般都是异步获取数据的，因此，在编写路由处理程序时，有少许变动：

```javascript
	exports.paths = '/';

	exports.get = function (server, request, response) {
		// 开启Session，待初始化完成后再访问Sesison数据
		server.sessionStart(function () {
			
			// 修改Session数据
			if (isNaN(server.session.count))
				server.session.count = 0;
			server.session.count ++;
			
			// 更新到自定义Session引擎，如果不调用此方法，将无法保存修改结果
			server.sessionObject.update();
			
			response.end('第' + server.session.count + '次');
		});
	}
```

**示例程序可看这里**：<https://github.com/leizongmin/QuickWeb/tree/master/examples/custom-session>

=====

### 3.与socket.io共享Session数据

如果需要在QuickWeb路由处理程序外部访问其中的Session数据，可以通过**web.session.get()**
和**web.session.getByCookie()**来获取指定的SessionObject实例：

* **web.session.get()**根据Session Id来获取其SessionObject实例；

* **web.session.getByCookie()**根据含有**_session_id**的Cookie字符串来获取其SessionObject实例；

而在socket.io中，我们在socket.io的连接验证时取得客户端的cookie字符串，从而获取相应的SessionObject实例，
达到共享Session的目的：

```javascript
	// 创建QuickWeb服务器
	var web = require('QuickWeb');
	var s = web.create();
	
	// 创建socket.io服务器
	var io = require('socket.io');
	io = io.listen(s);					// web.create()返回的是http.Server，可以直接与socket.io结合
	
	io.set('authorization', function (handshakeData, callback) {
		// 通过客户端的cookie字符串来获取其SessionObject实例
		var sessionObject = handshakeData.sessionObject = web.session.getByCookie(handshakeData.headers.cookie);
		// SessionObject.data即映射到内存中的session数据
		var session = sessionObject.data;
		
		// ... 其他程序 ...
		callback(null, true);
	});
```

**示例程序可看这里**：<https://github.com/leizongmin/QuickWeb/tree/master/examples/share-session>

=====

### 4.BigPipe输出模式

QuickWeb内置了类似于
[**BigPipe**](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)
的输出模式，可用于在一次页面请求中，需要同时进行多个数据查询，并返回结果的情况：

* 将网页分成多个小块，首先载入网页的整体框架：通过**response.pipe_init()**来初始化，
通过**response.pipe_tpl()**来载入网页整体框架；

* 各小块网页的数据查询异步进行，每块查询完毕及输出其结果，通过**response.pipe()**来输出结果；

* 待所有块均完成输出后才结束本次请求；

例：

```javascript
	exports.paths = '/pipe';
	exports.get = function (server, request, response) {
		
		// 初始化pipe
		response.pipe_init(['fill_1', 'fill_2', 'fill_3', 'fill_4', 'fill_5', 'fill_6', 'fill_7', 'fill_8', 'fill_9'],
						'finished'		// 输出完成后调用的函数名（客户端）
						300000);			// 超时时间，单位为毫秒，当超过此时间仍然未完成所有pipe输出时，则强制结束
										// 并在客户端回调函数中设置错误信息为“timeout”
		
		// 载入模板，调用response.renderFile()来进行
		response.pipe_tpl('pipe', {}, function () {
			
			// 生成随机的时间
			var random = function () { return Math.random() * 4000; }
			
			// 模拟数据查询，并返回结果
			setTimeout(function () { response.pipe('fill_1', 'red'); }, random());
			setTimeout(function () { response.pipe('fill_2', 'yellow'); }, random());
			setTimeout(function () { response.pipe('fill_3', 'blue'); }, random());
			setTimeout(function () { response.pipe('fill_4', 'black'); }, random());
			setTimeout(function () { response.pipe('fill_5', 'green'); }, random());
			setTimeout(function () { response.pipe('fill_6', 'magenta'); }, random());
			setTimeout(function () { response.pipe('fill_7', 'seagreen'); }, random());
			setTimeout(function () { response.pipe('fill_8', 'darkgoldenrod'); }, random());
			setTimeout(function () { response.pipe('fill_9', 'silver'); }, random());
		});
	}
```

模板**pipe**的代码如下：

```html
	<html>
	<head><title>pipe 测试页面</title><meta charset="utf-8" /></head>
	<style>
	td { width: 100px; height: 100px; text-align: center; border: 2px solid blue; }
	</style>
	<body>
	<h1>Pipe 测试页面</h1>
	以下方格会按顺序自动填充颜色
	<hr>
	<table>
		<tr>
			<td id="block_1">红色</td>
			<td id="block_2">黄色</td>
			<td id="block_3">蓝色</td>
		</tr>
		<tr>
			<td id="block_4">黑色</td>
			<td id="block_5">绿色</td>
			<td id="block_6">紫色</td>
		</tr>
		<tr>
			<td id="block_7">青色</td>
			<td id="block_8">棕色</td>
			<td id="block_9">灰色</td>
		</tr>
	</table>

	</body>
	<script>
	/**
	 * 给方格填充颜色
	 *
	 * @param {int} id 方格ID
	 * @param {string} color 颜色值
	 */
	var fill = function (id, color) {
		var n = document.getElementById('block_' + id);
		n.setAttribute('style', 'background-color:' + color);
	}

	/** 为各个方格设置颜色 */
	var fill_1 = function (color) { fill(1, color)}
	var fill_2 = function (color) { fill(2, color)}
	var fill_3 = function (color) { fill(3, color)}
	var fill_4 = function (color) { fill(4, color)}
	var fill_5 = function (color) { fill(5, color)}
	var fill_6 = function (color) { fill(6, color)}
	var fill_7 = function (color) { fill(7, color)}
	var fill_8 = function (color) { fill(8, color)}
	var fill_9 = function (color) { fill(9, color)}

	/** 完成 */
	var finished = function (err) {
		alert(err ? '出错了：' + err : 'OK');
	}
	</script>
	</html>
```

=====

### 5.与Multi-node结合

在创建QuickWeb实例时，设置端口号为**false**可以使QuickWeb返回一个未调用
listen()的http.Server实例。
例：

```javascript
	var web = require('QuickWeb');
	// 创建QuickWeb实例，但不自动调用listen()
	// 返回的server供multi-node来使用
	var server = web.create(false);
	
	var nodes = require('multi-node');
	// 创建multi-node
	nodes.listen({
			port: 80,		// 监听端口
			nodes: 4		// 线程数
		}, server);
```

**Multi-node**项目地址：<https://github.com/kriszyp/multi-node>

=====

## 6.定制QuickWeb

默认情况下，QuickWeb会自动载入所有的默认插件。你也可以通过**web.enable()**或**web.disable()**来
设置需要加载的插件，根据实际情况来搭建QuickWeb环境。
例：

```javascript
	// 将QuickWeb作为静态文件服务器
	var web = require('QuickWeb');
	web.set('home_path', './www');
	web.enable('file_server');		// 仅启用file_server插件及其依赖的插件
	web.create();
```

```javascript
	// 不启用cookie, session, render插件
	var web = require('QuickWeb');
	web.set('home_path', './www');
	web.disable('cookie', 'session', 'render');
	web.create();
```


## 扩展QuickWeb

### 1.QuickWeb运行机制

QuickWeb是基于Nodejs内置的http模块来创建服务器的，在接管**http.Server**的**request**事件时，
基于传入的http.ServerRequest和http.ServerResponse实例分别封装成了QuickWeb的**ServerRequest**
和**ServerResponse**实例，以提供丰富的功能。

在初始化ServerRequest、ServerResponse和ServerInstance后，QuickWeb将改此请求的控制权交给
**ServerInstance**，由其来选择相应的处理程序来完成该次请求。

```javascript
	/** request处理函数 */
	var requestHandle = function (req, _res) {
		var req = new request.ServerRequest(req);
		req.onready = function () {
			// 当ServerRequest初始化完成后，分别初始化ServerResponse和ServerInstance
			var res = new response.ServerResponse(_res);
			var si = new server.ServerInstance(req, res);

			/* 用于在request, response, server中访问另外的对象 */
			var _link = { request: req,	response: res,	server: si}
			req._link = res._link = si._link = _link;

			// 调用ServerInstance处理链来处理本次请求
			si.next();
		}
		// 初始化ServerRequest
		req.init();
	}
```

_待续_