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
    if (route.parse(12) !== null)
      throw Error();
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
    route.staticTable['/a'].should.eql(fun1);
  });
  
  it('#query', function () {
    if (route.query('/abc/a') !== null)
      throw Error();
    route.query('/abc').should.eql({ handle:  fun2
                                   , index:   0
                                   , value:   {a: 'abc'}
                                   });
     route.query('/abc', 1).should.eql({ handle:  fun4
                                   , index:   2
                                   , value:   {b: 'abc'}
                                   });
     route.query('hhh').should.eql({ handle:   fun3
                                   , index:    1
                                   , value:    null
                                   });
    route.query('/a').should.eql({ handle:  fun1
                                 , index:   0
                                 , value:   null
                                 });
  });
  
  it('#remove', function () {
    route.remove('/a:ab').should.equal(false);
    route.remove('/:b').should.equal(true);
    route.remove(/h+/).should.equal(true);
    route.remove('/a').should.equal(true);
    if (route.query('/abc') !== null)
      throw Error();
    if (route.query('/hhhh') !== null)
      throw Error();
    if (route.query('/a') !== null)
      throw Error();
  });
  
});
