var should = require('should');
var Service = require('../lib/Service');

var fs = require('fs');
var path = require('path');
var filecache = Service.import('filecache');

describe('Service filecache', function () {

  var f1 = '___test_4.txt';
  var f2 = path.resolve(f1);
  var data = 'abc';
  fs.writeFileSync(f1, data);
  
  
  // 多次修改文件后，是否会自动删除缓存，必须5秒内检测到
  it('#change file multi times', function (done) {
    function read (callback) {
        filecache.readFile(f1, function (err, data) {
        console.log('read cache:', data);
        // 是否在缓存中
        filecache.cache[f2].should.be.a('object');
        // 检查内容是否正确
        var data = fs.readFileSync(f1);
        console.log('read file:', data);
        data.should.eql(filecache.cache[f2].data);
        
        return callback();
      });
    }
    var times = 0;
    function change (data, callback) {
      times++;
      fs.writeFile(f1, data, function (err) {
        if (err)
          throw err;
      });
      var i = 0;
      var tid;
      tid = setInterval(function () {
        try {
          filecache.cache.should.have.keys(f2);
          i++;
        }
        catch (err) {
          clearInterval(tid);
          console.log('Success ' + times + ' times');
          return callback();
        }
        if (i > 5)
          throw Error('Watch file change timeout.');
      }, 1000);
    }
    
    read(function () {
      change('123', function () {
        read(function () {
          change('456', function () {
            read(function () {
              change('789', function () {
                read(function () {
                  fs.unlink(f1, done);
                });
              });
            });
          });
        });
      });
    });
  });
  
});