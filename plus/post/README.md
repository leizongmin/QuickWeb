# POST数据解析

## 设置

需要设置参数**tmp_path**为上传文件的临时目录（可选，默认为
/tmp，有些系统由于权限问题无法访问/tmp，会造成上传文件失败）

```javascript
web.set('tmp_path', './tmp');
```


## 访问POST参数

可以通过`ServerRequest.post`来访问该次请求提交的POST数据

```javascript
for (var i in request.post)
	response.write('POST   ' + i + ' = ' + request.post[i]);
```


## 访问上传的文件

可以通过`ServerRequest.file`来访问上传过来的文件

```javascript
for (var i in request.file) {
	response.write('文件尺寸：' + request.file[i].size);
	response.write('临时文件名：' + request.file[i].path);	// 通过临时文件名来读取该文件
	response.write('名称：' + request.file[i].name);
	response.write('类型：' + request.file[i].type);
	response.write('最后修改时间：' + request.file[i].lastModifiedDate);
}
```
