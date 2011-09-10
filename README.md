# QuickWeb

## 为什么要写QuickWeb

在此之前，我用过小问的[Web.js](https://github.com/iwillwen/Web.js)，当写的处理程序逐渐增大时，那种将各个
处理程序放在一个文件中注册的方式使代码显得有点凌乱。有时候我希望像
PHP那样，直接复制一个文件到某个指定目录然后就能运行，要移除某个处理
程序时，只需要删除相应的文件即可。

Web.js的主旨是“简单化部署”，它的做法是尽可能的少的输入代码，将所有
处理程序放在少数的几个文件里，以显出文件规模的小。我觉得它没有考虑
到文件的组织问题。


## QuickWeb的“简单化部署”

所有处理程序都放在相应独立的文件里，系统可以像搭积木一样任意增删各
种功能，这才是QuickWeb的简单之处。

QuickWeb的核心只封装了Nodejs内置模块中的http.Server、http.ServerRequest、
http.ServerResponse，以及一个简单的插件管理器，它要处理HTTP请求必须
依靠加载的各种插件来完成。比如cookie，session，router，POST数据解析
等待这些功能都需要相应的插件。

一下是一个简单的QuickWeb启动代码：

```javascript
var plus = require('./core/plus');
var web = require('./core/web');

var PLUS_PATH = './plus';			// 插件目录
var SERVER_PORT = 80;				// 服务器端口

// 设置服务器
web.set('wwwroot', './www');		// 网站目录
web.set('code_path', './code');		// 程序目录

// 载入插件并启动服务器
plus.load(PLUS_PATH);
var s = web.create(SERVER_PORT);
```

