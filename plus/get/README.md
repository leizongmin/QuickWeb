# GET参数解析

## GET请求参数

可以通过`ServerRequest.get`来访问GET请求参数

```javascript
for (var i in request.get)
	response.write('GET   ' + i + ' = ' + request.get[i]);
```


## 请求的文件名

可以通过`ServerRequest.filename`来访问请求的文件名（问号前面部分）

```javascript
response.write('文件名：' + request.filename);
```