var should = require('should');
var Service = require('../lib/Service');

// 注册一个服务
var s = Service.register('test');
s.say = function () {
  console.log.apply(null, arguments);
}

describe('Service Manager', function () {
  
  // 通过Service.import()获取的服务对象必须是只读的
  it('#service import should be read only', function () {
    Object.isFrozen(Service.import('test')).should.equal(true);
    Object.isFrozen(global.QuickWeb.Service.test).should.equal(true);
  });
  
  // 注册一个预定的服务
  var ns = {}
  ns.say = function () {
    console.log(Math.random(), Math.random());
  }
  it('#register service and define', function () {
    var x = Service.register('test2', ns);
    x.should.be.eql(ns);
  });
  
  // 不能重复定义一个服务
  it('#will cannot repeat register service', function () {
    try {
      var x = Service.register('test', ns);
      // 如果顺利执行下去，则抛出异常
      throw Error();
    }
    catch (err) {
      // 抛出异常表示成功
    }
  });
  
  // 加载服务
  var ts = require('../lib/service/test_service');
  it('#load service', function () {
    var s = Service.load('test_service');
    // 返回的服务对象为只读
    Object.isFrozen(s).should.equal(true);
    // 执行结果与手动加载的模块结果一样
    s.say('hello').should.equal(ts.say('hello'));
  });
  
  // import自动载入内置服务
  var ts2 = require('../lib/service/test_service_2');
  it('#load service from import()', function () {
    var s = Service.import('test_service_2');
    // 返回的服务对象为只读
    Object.isFrozen(s).should.equal(true);
    // 执行结果与手动加载的模块结果一样
    s.say('hello').should.equal(ts2.say('hello'));
  });
  
});

