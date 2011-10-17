v0.1.12
=========

* 新增**web.linkPath()**可用于设置虚拟目录，可以通过**web.file.resolve()**来解算出真实的文件路径；

* 新增**web.loadApp()**方法，将程序模块化。默认会自动扫描**./app**目录，并自动载入；

* URL中的中文字符串会自动解码；


v0.1.11
=========

* 增加方法**response.sendError()**用于想客户端响应指定的HTTP出错信息；

* 设置全局变量**QuickWeb**，在程序中可以通过global.QuickWeb来访问QuickWeb对象，可简化插件的编写；

* 修复安全问题：通过请求**/..**开头的路径来访问系统的任意目录；

* 增加静态文件服务缓存**Cache-Control**，可通过设置`web.set('file_maxage', 缓存秒数)`来设置默认的缓存时间；
通过设置`web.set('file_maxage_文件扩展名', 缓存秒数)`来设置指定文件类型的缓存时间；（仅针对浏览器客户端）

* 新增**Etag**插件：可通过`request.etag()`来校验客户端的Etag，通过`response.etag()`来设置响应的Etag，以实现动态页面的缓存机制；

* 新增MD5函数用于MD5加密，可通过**web.util.md5()**来访问；

* 新增**response.sendJSONIfAccepted()**，如果客户端接受JSON格式数据，则发送JSON数据，否则，调用回调函数;
可用于在同一页面中，根据客户端的发送的accept请求头来响应不同的数据格式；


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

