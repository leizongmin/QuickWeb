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
		response.end(err ? '成功！' : err);
	}
```

### 1.路由处理程序的编程环境

每个请求处理函数都接收3个参数，分别为**server**、**request**、**response**：

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
			path: 	'/',
			domain:	'xxx.com'
		});
	}
```

### 使用Session

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

