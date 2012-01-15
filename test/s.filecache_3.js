var should = require('should');
var Service = require('../lib/Service');

var fs = require('fs');
var path = require('path');
var filecache = Service.import('filecache');

describe('Service filecache', function () {

  var f1 = '___test_.txt';
  var f2 = path.resolve(f1);
  var data = 'hhhfjjjjdksjkdjskjdk';
  for (var i = 0; i < 100; i++)
    data += 'ddddddddddddddddddddddddsafsdfjsdjglfdjlgjdflkglkdfjgkldfjlkgdflj';
  fs.writeFileSync(f1, data);
  console.log('开始...');
  
  // 连续执行10000次读文件操作，不出错（10秒钟内）
  var COUNT = 10000;
  it('call #readFile ' + COUNT + ' times', function (done) {
    var c = 0;
    for (var i = 0; i < COUNT; i++) {
      process.nextTick(function () {
        filecache.readFile(f1, 'utf8', function (err, d) {
          if (err)
            throw err;
          d.should.eql(data);
          
          c++;
          if (c >= COUNT)
            done();
        });
      });
    }
  });
  
  // 连续执行10000次读文件属性操作，不出错（10秒钟内）
  var COUNT = 10000;
  var stats = fs.statSync(f1);
  it('call #stat ' + COUNT + ' times', function (done) {
    var c = 0;
    for (var i = 0; i < COUNT; i++) {
      process.nextTick(function () {
        filecache.stat(f1, function (err, s) {
          if (err)
            throw err;
          s.should.eql(stats);
          
          c++;
          if (c >= COUNT) {
            fs.unlink(f1);
            done();
          }
        });
      });
    }
  });
  
});