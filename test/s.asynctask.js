var should = require('should');
var Service = require('../lib/Service');

describe('service.asynctask', function () {
  
  var asynctask = Service.import('asynctask');
  
  it('#Parallel', function (done) {
  
    // Parallel使用示例
    var p = asynctask.Parallel(function (input, callback) {
      console.log('输入：', input);
      setTimeout(function () {
        if (input < 1)
          callback(Error('Num less than 1'));
        else
          callback(null, input);
      }, Math.random() * 1000);
    });
    console.log(p);
    p.on('one', function (one) {
      console.log('完成进度：', one);
    });
    p.on('error', function (err, input) {
      console.error('出错了：' + err.stack, input);
    });
    var E = function (v) { return {key: 'key' + v, value: v} }
    p.start([E(1),E(2),E(0),E(3),E(5),E(-1),E(0)], function (output) {
      console.log('结果：', output);
      done();
    });
  
  });
  
  
  it('#Queue', function (done) {
    
    // Queue使用示例：
    var q = asynctask.Queue(function (input, callback) {
      console.log('输入：', input);
      setTimeout(function () {
        if (input < 1)
          callback(Error('Num less than 1'));
        else
          callback(null, input);
      }, 100);
    });
    console.log(q);
    q.on('one', function (one) {
      console.log('完成进度：', one);
    });
    q.on('error', function (err) {
      console.error('出错了：' + err.stack);
    });
    var E = function (v) { return {key: 'key' + v, value: v} }
    q.start([E(1),E(2),E(0),E(3),E(5),E(-1),E(0)], function (output) {
      console.log('结果：', output);
      output.should.eql([E(1), E(2), E(3), E(5)]);
      done();
    });
    
  });
});