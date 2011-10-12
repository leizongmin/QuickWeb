v0.1.11
=========

* 增加方法**response.sendError()**用于想客户端响应指定的HTTP出错信息；

* 设置全局变量**QuickWeb**，在程序中可以通过QuickWeb来访问QuickWeb对象，可简化插件的编写；

* 修复安全问题：通过请求**/..**开头的路径来访问系统的任意目录；

* 增加静态文件服务缓存**Cache-Control**，可通过设置`web.set('file_maxage', 缓存秒数)`来设置默认的缓存时间；
通过设置`web.set('file_maxage_文件扩展名', 缓存秒数)`来设置指定文件类型的缓存时间；（仅针对浏览器客户端）

* 增加**Etag**插件：可通过`request.etag()`来校验客户端的Etag，通过`response.etag()`来设置响应的Etag，以实现动态页面的缓存机制；


v0.1.10
=========

* 进一步简化了QuickWeb的部署，默认静态文件目录为**./html**，路由处理程序目录为**./code**，
模板目录为**./tpl**，如果存在**./plus**则自动载入该目录里面的插件；
(可通过**web.set('use_default_config', false)**来禁用此功能)


v0.1.9
=========

* `web.set()`可以一次设置多个参数；

* 可以通过设置参数**default_file**来指定默认的首页文件，当读取的文件名是一个目录时，会自动加上该默认文件名。
如果不设置，默认为**index.html**；

* 可以通过`web.enable()`或`web.disable()`来设置加载哪些插件。比如要实现一个简单的静态文件服务器，
设置`web.enable('file_server');`即可；


v0.1.8
=========

* 自定义Session引擎支持，在程序中可以通过`server.sessionStart()`、
`server.sessionUpdate()`、`server.serverEnd()`来操作；

* 路由处理程序支持设置多个目录，`web.set('code_path', [..数组..])`;


v0.1.7
=========

* 增加调试输出等级切换：`web.setLogLevel(3)`;

* 增加文件缓存插件，程序可以通过`web.file.read()`代理来读取文件；
`response.renderFile()`，`response.sendFile()`以及静态文件服务均采用该文件缓存；

* 路由处理程序修改后，可动态载入，无需重新启动程序；

