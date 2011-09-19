# 响应请求

## 设置

需要设置参数**home_path**为sendFile()发送文件时的根目录

```javascript
web.set('home_path', './www');
```


## 依赖

+ **mime-type**插件


## 响应JSON字符串

可以通过`ServerResponse.sendJSON(data)`来响应JSON格式数据

```javascript
response.sendJSON({name: 'test'});
```


## 发送文件

可以通过`ServerResponse.sendFile(filename)`来响应一个文件

```javascript
response.sendFile('index.html');
```


## 302重定向

可以通过`ServerResponse.redirect(target)`来重定向当前请求

```javascript
response.redirect('/home');
```
