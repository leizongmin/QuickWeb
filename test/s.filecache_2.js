var should = require('should');
var Service = require('../lib/Service');

var fs = require('fs');
var path = require('path');
var filecache = Service.import('filecache');

describe('Service filecache', function () {

  var f1 = '___test_2.txt';
  var f2 = path.resolve(f1);
  var data = 'hhhfjjjjdksjkdjskjdk';
  fs.writeFileSync(f1, data);
  
  // 读取文件属性，检查是否在缓存中
  it('#readFile', function (done) {
    filecache.stat(f1, function (err, stats) {
      console.log(stats);
      // 是否在缓存中
      filecache.cache[f2].should.be.a('object');
      // 检查属性是否正确
      var stats = fs.statSync(f1);
      console.log(stats);
      stats.should.eql(filecache.cache[f2].stats);
      
      done();
    });
  });
  
  // 修改文件后，是否会自动删除缓存，必须5秒内检测到
  it('#change file', function (done) {
    var i = 0;
    var tid;
    tid = setInterval(function () {
      try {
        filecache.cache.should.have.keys(f2);
        i++;
      }
      catch (err) {
        clearInterval(tid);
        done();
      }
      if (i > 5)
        throw Error();
    }, 1000);
      
    fs.writeFile(f1, 'dsds---', console.log);
  });
  
  // 删除文件后，是否会自动删除缓存，必须5秒内检测到
  it('#change file', function (done) {
    var i = 0;
    var tid;
    tid = setInterval(function () {
      try {
        filecache.cache.should.have.keys(f2);
        i++;
      }
      catch (err) {
        clearInterval(tid);
        done();
      }
      if (i > 5)
        throw Error();
    }, 1000);
      
    fs.unlink(f1);
  });
  
});