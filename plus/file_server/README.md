# 静态文件服务

## 设置

需要设置参数**home_path**为静态文件的根目录
需要设置参数**page_出错代码**定义相应的出错页面的HTML代码，如果没有定义，则使用系统默认输出

```javascript
web.set('home_path', './www');
web.set('page_404', '文件没找到!');
web.set('page_500', '出错了');
```


## 依赖

+ **mime-type** 插件

+ **get** 插件