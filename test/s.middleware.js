var should = require('should');
var Service = require('../lib/Service');

describe('service.middleware', function () {
  
  var MiddleWare = Service.import('middleware').create;
  
  it('#use', function (done) {
    var mw = MiddleWare();
    var add = function (req, res, next) {
      if (isNaN(req.sum))
        req.sum = 1;
      else
        req.sum++;
      next();
    }
    mw.use(add);
    mw.use(add, add, add);
    
    mw.start({}, {}, function (req, res) {  
      console.log(req);
      req.sum.should.equal(4);
      done();
    });
  });
  
});