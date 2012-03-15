开始编写应用程序
===================

QuickWeb应用的处理程序都放在应用的code目录里面。

在初始化应用之后，默认会在code目录里面创建一个index.js的文件，其内容如下：

    /**
     * 用于测试的页面
     */
     
    exports.get = function (req, res) {
      res.send('现在的时间是：' + new Date().toString());
    }

每个文件都是一个Node.js模块文件，通过module.exports来输出相应的处理函数。
比如，`exports.get`表示用于处理GET请求方法的处理函数，相应地，如果要处理
POST、PUT、HEAD、DELETE等请求方法，则输出`exports.post`、`exports.put`、
`exports.head`、`exports.delete`即可。


每个处理函数接收两个参数： `function (req, res) { ... }`

*  其中第一个参数是该次请求的ServerRequest对象，主要用于获取该次请求客户端发送过来
的数据，比如GET参数、POST参数、Cookies、Headers等；

*  第二个参数是该次请求的ServerResponse对象，主要用于对该次请求进行响应，比如输出数据、
渲染模板等；


在载入应用之后，可以通过请求URL**/index.nsp**来访问该文件相应的处理程序

*  如果程序文件名是test.js，则通过请求URL**/test.nsp**来访问；

*  如果程序文件名是test/test.js，则通过请求URL**/test/test.nsp**来访问；

*  当请求的URL为**/index.nsp**时，可以简化为**/**；


如果需要自己指定访问路径，比如要实现RESTful的URL，可以通过`exports.path`来指定：

*  `exports.path = '/abc'`这样指定通过请求URL**/abc**来访问；

*  `exports.path = '/test/:name'`这样指定了一个可任意匹配`:name`部分的URL，
比如**/test/a**和**/test/bc**都能匹配的；



## ServerRequest对象


### 获取请求参数

*  **request.get** 请求的GET参数，比如请求URL为`/?a=1&b=2`，则`request.get = {a:1, b: 2}`；

*  **request.post** 请求的POST参数（与request.get差不多）；

*  **request.cookie** 请求的Cookie，比如Cookies为`a=1; b=2`，则`request.cookie = {a:1, b: 2}`；

*  **request.file** 上传的文件，比如上传的文件`name="file1"*，则通过`request.file.file1`来获取该
上传文件的信息。其中包括以下信息：`{size: 文件大小, path: 临时文件路径, name: 文件名, type: 文件类型}`

*  **request.session** 该请求的Session会话信息；

*  **request.path** 如果指定了`exports.path`且其中包含诸如**:name**这样的字符串时，该部分的参数
会被存储到`request.path`中。比如，`exports.path = '/test/:name'`，当请求的URL为**/test/xiao**时，
则`request.path.name = 'xiao'`；

*  **request.url** 请求的URL路径，比如请求的URL为`/abc?a=2`，则`request.url = '/abc?a=2'`；

*  **request.filename** 请求的文件名，即`request.url`中问号前面部分，比如上例中，
`request.filename = '/abc'`；

*  **request.headers** 请求的Header信息；

注意：

*  `request.post`和`request.file`仅在POST或PUT请求方法时才有，并且需要在`request.on('post complete')`
事件之后；

*  `request.session`需要在执行`request.sessionStart()**之后才有；


### 方法

* **request.accepts(type)** 检查客户端是否接受指定文件类型，比如：
请求头是`accept: application/json; text/html`，则执行`request.accepts('json')`会返回**true**，
执行`request.accepts('jpg')`会返回**false**；

* **request.auth()** 解析请求头中的**authorization**，并返回相应的信息，一般用于auth认证，
比如请求头是`Authorization:Basic YWRtaW46YWRtaW4=`，则执行`request.auth()`会返回
`{username: 'admin', password: 'admin'}`，如果解析失败，返回**null**；

*  **request.header(name, [defaultValue])** 返回指定顶请求头信息，如果不存在，且设置了默认值，则返回默认值；

*  **request.sessionStart([callback])** 打开Session数据，当Session ID不存在时，会自动为客户端
分配一个；如果Session ID存在时，会载入该Sesison文件的数据；载入完毕后，会调用相应的回调函数，
并可通过`request.session`来访问该Session数据；

*  **request.sessionUpdate([callback])** 如果修改了`request.session`上的数据，可通过执行此方法来
保存更改，否则对`request.session`的更改是不会保存的；

*  **request.sessionEnd([callback])** 删除当前Session信息；

*  **request.config(name, [value])** 获取或设置当前request对象的配置。当指定了第二个参数value时，
为设置操作；


### 事件

*  **post complete** 当请求方法为POST或PUT时，客户端发送数据完毕会触发该事件。如果需要用到
`request.post`或`request.file`的数据，则要等待触发该事件之后才能进行；

*  **post error** 当请求方法为POST或PUT时，如果在解析POST数据时出错，则会触发该事件。该事件
接收一个参数，即出错信息的Error实例。当触发该事件时，需要编写代码来对客户端进行响应；

*  **session start** 当载入Session数据完毕时（相当于`request.sessionStart()`中的回调函数）触发该
事件。该事件接收一个参数，为该Session的SessionObject实例；



## ServerResponse对象


### 方法

*  **response.authFail()** 当Auth认证失败时，通过此方法来进行响应。一般与`request.auth()`配合使用；

*  **response.setCookie(name, value, [options])** 设置Cookie，其中options为可选项，具体如下：

  *  **path** Cookie的路径，默认为**/**；
  
  *  **expires** 过期时间，可以为毫秒格式的整数，或者Date对象，表示该Cookie会在指定的时间后过期；
  
  *  **maxAge** 过期时间，单位为秒，表示该Cookie会在当前时间之后经过指定maxAge秒后过期；
  
  *  **domain** Cookie的域，默认不设置；
  
  *  **secure** 是否仅在HTTPS请求时有效，当为true时，仅在HTTPS请求时才会发送该Cookie，默认为false；
  
  * **httpOnly** 是否禁止客户端JavaScript代码修改该Cookie（需要浏览器支持），默认为true；

  * **注意：** **expires**和**maxAge**仅能同时指定一个，如果没有指定，则Cookie默认的过期时间为当前时刻；
  
*  **response.clearCookie(name, [options])** 清除指定Cookie，options为可选项，同上；

*  **response.contentType(type)** 设置响应的Content-Type，相当于`response.setHeader('Content-Type', type)`；

*  **response.header(name, [value])** 获取或设置响应的Header，
当不指定参数value时，相当于`response.getHeader(name)`；
当指定参数value时，相当于`response.setHeader(name, value)`；

*  **response.status(code)** 设置响应代码，相当于`response.statusCode = code`；

*  **response.setEtag(tag)** 设置响应的ETag，相当于`response.header('ETag', tag)`；

*  **response.redirect(url, [code])** 转向到指定URL，当不指定响应代码时，默认为301；

*  **response.sendJSON(data)** 响应JSON格式数据；

*  **response.send(data)** 响应文本数据；

*  **response.sendError(status, msg)** 响应出错信息，比如`response.sendError(500, '内部错误')`；

*  **response.sendFile(filename)** 响应一个文件。该文件的路径在应用的html目录下；

*  **response.sendStaticFile(filename)** 同上，响应一个文件，在响应之前会判断文件是否过期，如果
未过期则响应304；

*  **response.render(tpl, data, [eng])** 渲染文本内容，参数tpl为模板内容，参数data为用于渲染的
数据，参数eng为模板引擎名称，默认为ejs；执行后返回渲染后的文本内容；

*  **response.renderFile(filename, data)** 渲染指定模板文件并响应；模板文件的路径在应用的tpl目录下；

*  **response.config(name, [value])** 获取或设置当前request对象的配置。当指定了第二个参数value时，
为设置操作；


### 事件

*  **header before** 在开始输出响应的Header之前，触发该事件；

*  **header after** 在输出响应的Header结束后，触发该事件；

*  **send error** 当在执行`response.sendError()`时，准备响应给客户端前，触发该事件，
该事件接收两个参数，第一个参数为响应代码，第二个参数为出错信息描述，
分别对应`response.sendError(status, msg)`的两个参数；

*  **end** 在本次请求响应完毕后，触发该事件；

