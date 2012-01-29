var should = require('should');
var quickweb = require('../');


describe('Connector', function () {

  var connector = quickweb.Connector.create();
  
  // 默认
  it('#default', function () {
    connector.addCode('default', { path: '/test'
                                 , get: function () { return 'test'; }});
    var route = connector.getHostRoute('baidu.com', 'GET');
    should.exist(route);
    
    var h = route.query('/test');
    should.exist(h);
    
    h.handle().should.equal('test');
    
    var h = route.query('/test/2');
    should.not.exist(h);
  });
  
  // 新应用，虚拟目录
  it('#app', function () {
    connector.addApp('app1', { path: '/app1'});
    connector.addCode('app1', { path: '/test'
                              , get: function () { return 'app1'; }});
    var route = connector.getHostRoute('qq.com', 'GET');
    should.exist(route);
    
    var h = route.query('/app1/test');
    should.exist(h);
    
    h.handle().should.equal('app1');
    
    var h = route.query('/app1/test/2');
    should.not.exist(h);
  });
  
  // 新应用，虚拟主机
  it('#host', function () {
    connector.addApp('app2', { host: 'ucdok.com'});
    connector.addCode('app2', { path: '/test'
                              , get: function () { return 'app2'; }});
                              
    var route = connector.getHostRoute('weibo.com', 'GET');
    should.exist(route);
    
    var h = route.query('/test');
    should.exist(h);
    
    h.handle().should.equal('test');
    
    var route = connector.getHostRoute('ucdok.com', 'GET');
    should.exist(route);
    
    var h = route.query('/test');
    should.exist(h);
    
    h.handle().should.equal('app2');
  });

});