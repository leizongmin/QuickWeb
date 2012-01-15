var should = require('should');
var Service = require('../lib/Service');
var queue = Service.import('queue');

describe('service.queue', function () {

  // 测试wait的顺序
  it('#wait', function (done) {
    
    // 模拟一个异步操作
    var hasCache = false;   
    var q = {}
    var doAsync = function (id, callback) {
      if (hasCache)
        callback(id);
      else {
        var cb1 = function () {
                      doAsync(id, callback);
                 }
        var cb2 = function (callback) {
                      setTimeout(function () {
                          hasCache = true;
                          callback(id);
                      }, 100);
                 }
        queue.wait(q, 'test', cb1, cb2, callback);
      }
    }
    
    // 检查顺序是否一致
    var c = 0;
    var COUNT = 100;
    var ret = [];
    var order = [];
    for (var i = 0; i < COUNT; i++) {
      order.push(i);
      doAsync(i, function (id) {
        ret.push(id);
        console.log('id=', id);
        c++;
        if (c >= COUNT) {
          ret.should.eql(order);
          process.nextTick(function () {
            // 检查是否已删除该队列，如果完成了却没有删除该队列
            // 会导致下次操作无法相应
            q.should.not.have.key('test');
            done();
          });
        }
      });
    }
  });
});