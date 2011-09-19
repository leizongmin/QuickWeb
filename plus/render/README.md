# 渲染文件

## 设置

需要设置设置参数**template_path**为模板的根目录，

参数**template_extname**为默认的模板扩展名（可选）

参数**render_to_html**为渲染函数，格式为 function (str, view); str为模板内容, view为模板里面用到的数据, 函数返回字符串类型
_(默认不使用任何模板渲染引擎，直接返回原字符串)_

```javascript
	web.set('template_path', './tpl');
	web.set('template_extname', 'html');
	// 定义模板渲染函数
	var mustache = require('mustache');
	web.set('render_to_html', function (str, view) {
		return mustache.to_html(str, view);
	});
```


## 渲染字符串

可以通过`ServerInstance.render(str_tpl, view)`来渲染字符串

```
	var html = server.render('{{name}}，你好！', {name: '老雷'});
```


## 渲染文件

### 1.渲染文件并回调

可以通过`ServerInstance.renderFile(template, view, callback)`来渲染文件，
渲染完毕调用指定回调函数

```javascript
	server.renderFile('block', {name: 'haha'}, function (data) {
		if (!data)
			console.log('出错了！');
		else
			response.write(data);
	});
```


### 2.渲染文件并响应

可以通过`ServerResponse.renderFile(template, view, content_type)`来渲染文件，
并响应给客户端

```javascript
	response.renderFile('index', {username: 'test'}, 'text/html');
```
