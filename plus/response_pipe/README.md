# PIPE输出

## 设置

需要设置参数**pipe_timeout**为默认的超时时间（单位为毫秒，默认为1分钟）


## 依赖

需要render插件来渲染模板


## 初始化

可以通过`ServerResponse.pipe_init(pipes, callback, [timeout])`来初始化
该次请求的Pipe输出。

```javascript
response.pipe_init(
	['fill_1', 'fill_2', 'fill_3'],		// Pipe输出列表
	'finished',							// 所有输出结束后回调函数，该函数接收一个参数，表示出错信息，为undefined表示成功
	60000								// 超时时间
);
```


## 设置框架文件

可以通过`ServerResponse.pipe_tpl(template, view, callback)`来设置框架文件。
框架文件表示在所有Pipe输出前需要载入的部分，使用
`ServerResponse.renderFile()`来渲染。

```javascript
response.pipe_tpl('index', {}, function () {
	// 此处开始执行pipe输出
	// ...
}
```


## PIPE输出

可以通过`ServerResponse.pipe(pipe, data)`来进行pipe输出。其中pipe为
在初始化时注册的pipe输出列表中的一个，即在客户端要调用的javascript
函数名称，data为要调用的函数的第一个参数，可用于在客户端渲染页面

```javascript
response.pipe('fill_1', {color: 'red'});
/*
此时会在客户端输出如下代码：
<script>fill_1({color:red});</script>
*/
```
