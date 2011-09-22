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
	var web = require('./core/web');

	// 设置
	web.set('home_path', './www');			// 网站根目录
	web.set('code_path', './code');			// 程序目录

	// 创建服务器，监听80端口
	var s = web.create(80);
```

上面的程序中，定义了网站的根目录为**./www**，当别人访问你的网站时，所有的文件都是从这个
目录里面查找的；

程序目录为**./code**，网站服务器端的处理程序将放在这个目录里面。

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

### 2.自定义Session引擎

默认情况下，QuickWeb使用的Session将数据存储在本机的内存里，只能由本实例的访问。
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

* 通过**this.fill**来将Session数据映射到内存中；

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

### 3.与socket.io共享Session数据

