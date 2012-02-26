var should = require('should');
var Service = require('../lib/Service');
var jade = require('jade');

describe('service.renderer.jade', function () {

  var renderer = Service.import('renderer.jade');

  var tpl = 'html\
    head\
      title Example\
      script\
        if (foo) {\
          bar();\
        } else {\
          baz();\
        }';
  
  // ‰÷»æ
  it('#render', function () {
    renderer.render(tpl).should.equal(jade.compile(tpl)());
  });
  
  // ±‡“Î
  it('#compile', function () {
    var f1 = jade.compile(tpl);
    var f2 = renderer.compile(tpl);
    f1().should.equal(f2());
  });
  
});