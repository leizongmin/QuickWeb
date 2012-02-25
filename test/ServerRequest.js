var should = require('should');
var quickweb = require('../');
var http = require('http');
var fs = require('fs');

describe('ServerRequest', function () {

  // 解析GET参数
  it('#decode GET', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      req = quickweb.extendRequest(req);
      req.get.should.eql({a: '1', b: '2', c: '3'});
      req.filename.should.equal('/hi');
      res.end('ok');
    });
    server.listen(8011);
    
    // 发起请求
    http.request({ host:  '127.0.0.1'
                 , path:  '/hi?a=1&b=2&c=3'
                 , method:'GET'
                 , port:  8011
                 }, function (res) {
      server.close();
      done();
    }).end();
  });
  
  // 解析Cookie
  it('#decode Cookie', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      req = quickweb.extendRequest(req);
      req.cookie.should.eql({a: '1', b: '2', c: '3'});
      res.end('ok');
    });
    server.listen(8011);
    
    // 发起请求
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , headers: { cookie: 'a=1; b=2; c=3;'}
                 , method:'GET'
                 , port:  8011
                 }, function (res) {
      server.close();
      done();
    }).end();
  });
  
  // 解析POST
  it('#decode POST', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      req = quickweb.extendRequest(req);
      req.on('post complete', function () {
        req.post.should.eql({a: '1', b: '2', c: '3'});
        res.end('ok');
      });
      req.on('post error', function (err) {
        throw err;
      });
    });
    server.listen(8011);
    
    // 发起请求
    var data = 'a=1&b=2&c=3';
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'POST'
                 , headers:{'content-type': 'application/x-www-form-urlencoded'
                           , 'content-length': data.length
                           }
                 , port:  8011
                 }, function (res) {
      server.close();
      done();
    }).end(data);
  });
  
  // 解析POST octet-stream
  it('#decode POST octet-stream', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      req = quickweb.extendRequest(req);
      req.on('post complete', function () {
        req.file.stream.size.should.equal(data.length);
        req.file.stream.name.should.equal('stream');
        req.file.stream.type.should.equal('application/octet-stream');
        JSON.parse(fs.readFileSync(req.file.stream.path, 'utf8'))
            .should.eql({a: 1, b: 2, c: 3});
        res.end('ok');
      });
      req.on('post error', function (err) {
        throw err;
      });
    });
    server.listen(8011);
    
    // 发起请求
    var data = JSON.stringify({a: 1, b: 2, c: 3});
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'POST'
                 , headers:{'content-type': 'application/octet-stream'
                           , 'content-length': data.length
                           }
                 , port:  8011
                 }, function (res) {
      server.close();
      done();
    }).end(data);
  });
    
  // 解析POST json
  it('#decode POST json', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      req = quickweb.extendRequest(req);
      req.on('post complete', function () {
        req.post.should.eql({a: 1, b: 2, c: 3});
        res.end('ok');
      });
      req.on('post error', function (err) {
        throw err;
      });
    });
    server.listen(8011);
    
    // 发起请求
    var data = JSON.stringify({a: 1, b: 2, c: 3});
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'POST'
                 , headers:{'content-type': 'application/json'
                           , 'content-length': data.length
                           }
                 , port:  8011
                 }, function (res) {
      server.close();
      done();
    }).end(data);
  });
});