var should = require('should');
var quickweb = require('../');
var http = require('http');
var fs = require('fs');
var tool = quickweb.import('tool');

describe('ServerResponse', function () {

  // send
  it('#send', function (done) {
    // 创建服务器
    var server = http.createServer(function (req, res) {
      res = quickweb.extendResponse(res);
      res.send('hello');
    });
    server.listen(8012);
    
    // 发起请求
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'GET'
                 , port:  8012
                 }, function (res) {
      res.statusCode.should.equal(200);
      var a = tool.bufferArray();
      res.on('data', function (d) { a.add(d); });
      res.on('end', function () {
        var body = a.toString();
        body.should.equal('hello');
        
        server.close();
        done();
      });
    }).end();
  });
  
  
  // sendJSON
  it('#sendJSON', function (done) {
    // 创建服务器
    var data = {a: 123, b: 456, c: 789}
    var server = http.createServer(function (req, res) {
      res = quickweb.extendResponse(res);
      res.sendJSON(data);
    });
    server.listen(8012);
    
    // 发起请求
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'GET'
                 , port:  8012
                 }, function (res) {
      res.statusCode.should.equal(200);
      res.headers['content-type'].indexOf('json').should.not.equal(-1);
      
      var a = tool.bufferArray();
      res.on('data', function (d) { a.add(d); });
      res.on('end', function () {
        var body = a.toString();
        JSON.parse(body).should.eql(data);
        
        server.close();
        done();
      });
    }).end();
  });
  
  
  // sendError
  it('#sendError', function (done) {
    // 创建服务器
    var msg = 'just for test';
    var server = http.createServer(function (req, res) {
      res = quickweb.extendResponse(res);
      res.sendError(555, msg);
    });
    server.listen(8012);
    
    // 发起请求
    http.request({ host:  '127.0.0.1'
                 , path:  '/'
                 , method:'GET'
                 , port:  8012
                 }, function (res) {
      res.statusCode.should.equal(555);
      
      var a = tool.bufferArray();
      res.on('data', function (d) { a.add(d); });
      res.on('end', function () {
        var body = a.toString();
        body.indexOf(msg).should.not.equal(-1);
        
        server.close();
        done();
      });
    }).end();
  });
  
});