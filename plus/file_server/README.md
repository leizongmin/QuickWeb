# 静态文件服务

## 设置

需要设置参数**home_path**为静态文件的根目录
需要设置参数**page_404**为404出错页面的HTML代码

```javascript
web.set('home_path', './www');
web.set('page_404', '文件没找到!');
```


## 依赖

+ **mime-type** 插件

+ **get** 插件