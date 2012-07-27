## v0.4版已迁移至这里：https://github.com/quickweb/quickweb

## 如有问题，请联系 [@老雷](http://weibo.com/ucdok)









## [帮助文档：http://leizongmin.github.com/QuickWeb/](http://leizongmin.github.com/QuickWeb/)



v0.3.5更新  2012-4-20
===================

*  增加了`response.mvcRender()`方法
>  该方法使用TinyLiquid模板引擎进行渲染，需要在应用配置文件中开启该选项：`enableMVC:true`
> 
>  在应用配置文件中，设置`MVCModels`选项可用于注册渲染时获取各数据的方法，详见TinyLiquid模板：https://github.com/leizongmin/tinyliquid

*  为应用增加`middleware`目录，该目录中每个文件为一个中间件，代码格式：

    module.exports = function (req, res, next) {
      // 处理...
      return next();
    };
    
>  中间件名称：假如文件名为`login.js`，则其名称为`login`，如为`test/login.js`则为`test.login`
>  是用中间件：
>
>    应用全局中间件：在config.js中输出 exports.middleWare = ['中间件1', '中间件2'];
>
>    控制器局部中间件：在code目录里面的文件中，输出 exports.use = ['中间件1', '中间件2'];

*  控制器中的POST|PUT方法的`post complete`事件被取消，原来如下形式的代码：

    exports.post = function (req, res) {
      req.on('post complete', function (req, res) {
        // ...处理
      });
    };
    
  将被改为如下形式：
   
    exports.post = function (req, res) {
      // ...处理
    };
    
  如需要在`post complete`事件前进行处理，可注册中间件来解决。
  
*  增加基于redis的Session存储引擎。

