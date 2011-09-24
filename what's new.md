## v0.1.7

* 增加调试输出等级切换：web.setLoggerLevel(3);

* 增加文件缓存插件，程序可以通过web.file.read()代理来读取文件；
renderFile()，sendFile()以及静态文件服务均采用该文件缓存；

* 路由处理程序修改后，可动态载入，无需重新启动程序；

