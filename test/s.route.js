var should = require('should');
var Service = require('../lib/Service');
var Route = Service.import('route').create;

describe('Service.Route', function () {

  var route = Route();
  
  it('#parse', function () {
    route.parse('/a').should.eql({path: '/a', names: null});
    route.parse('/:a/hello:type')
      .should.eql({ path: /^\/([^\/]+)\/hello([^\/]+)$/
                  , names: [ 'a', 'type' ]
                  });
    route.parse(/h+/).should.eql({path: /h+/, names: null});
    should.equal(route.parse(12), null);
  });

  var fun1 = function () { return 'fun1'; }
  var fun2 = function () { return 'fun2'; }
  var fun3 = function () { return 'fun3'; }
  var fun4 = function () { return 'fun4'; }
    
  it('#add', function () {
    route.add('/a', fun1);
    route.add('/:a', fun2);
    route.add(/h+/, fun3);
    route.add('/:b', fun4);
    route.staticTable['/a'].should.eql({handle: fun1, info: {}});
  });
  
  it('#query', function () {
    should.equal(route.query('/abc/a'), null);
    
    route.query('/abc').should.eql({ handle:  fun2
                                   , index:   0
                                   , value:   {a: 'abc'}
                                   , info:    {}
                                   });
     route.query('/abc', 1).should.eql({ handle:  fun4
                                   , index:   2
                                   , value:   {b: 'abc'}
                                   , info:    {}
                                   });
     route.query('hhh').should.eql({ handle:  fun3
                                   , index:   1
                                   , value:   []
                                   , info:    {}
                                   });
    route.query('/a').should.eql({ handle:  fun1
                                 , index:   0
                                 , value:   null
                                 , info:    {}
                                 });
  });
  
  it('#remove', function () {
    route.remove('/a:ab').should.equal(false);
    route.remove('/:b').should.equal(true);
    route.remove(/h+/).should.equal(true);
    route.remove('/a').should.equal(true);
    should.equal(route.query('/abc'), null);
    should.equal(route.query('/hhhh'), null);
    should.equal(route.query('/a'), null);
  });
  
});
