## v0.1.8

* 自定义Session引擎支持，在程序中可以通过`server.sessionStart()`、
`server.sessionUpdate()`、`server.serverEnd()`来操作；

* 路由处理程序支持设置多个目录，`web.set('code_path', [..数组..])`;


## v0.1.7

* 增加调试输出等级切换：`web.setLogLevel(3)`;

* 增加文件缓存插件，程序可以通过`web.file.read()`代理来读取文件；
`response.renderFile()`，`response.sendFile()`以及静态文件服务均采用该文件缓存；

* 路由处理程序修改后，可动态载入，无需重新启动程序；

