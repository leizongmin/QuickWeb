# QuickWeb v0.2

安装QuickWeb
----------------------------

目前QuickWeb仍处于测试阶段，没有发布到npm中，你需要用Git直接下载QuickWeb的源码：

	git clone git://github.com/leizongmin/QuickWeb.git
	
QuickWeb需要依赖以下npm包：

* **formidable** 解析POST数据。项目地址：[https://github.com/felixge/node-formidable](https://github.com/felixge/node-formidable)

* **mustache** QuickWeb默认的模板引擎。项目地址：[http://mustache.github.com/](http://mustache.github.com/)

* **EventProxy.js** 事件代理。项目地址：[https://github.com/JacksonTian/eventproxy](https://github.com/JacksonTian/eventproxy)

你需要执行以下命令手动安装以上的npm包：**npm install formidable mustache EventProxy.js**

如果你使用的是Linux系统，你需要将QuickWeb目录下的cli.js文件链接到/usr/bin/quickweb：
**link cli.js /usr/bin/quickweb**

如果你使用的是Windows系统，你需要在创建以下文件，并保存到C:\Windows\quickweb.bat：
	
	node /cygdrive/e/github/qweb/cli %1
	
其中/cygdrive/e/github/qweb/cli为QuickWeb中的cli.js文件在您系统中的实际位置，您需要
根据实际情况自行修改。