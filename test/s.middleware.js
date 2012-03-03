var should = require('should');
var Service = require('../lib/Service');

describe('service.middleware', function () {
  
  var AsyncMiddleWare = Service.import('middleware').createAsync;
  var SyncMiddleWare = Service.import('middleware').createSync;
  
  it('#AsyncMiddleWare', function (done) {
    var mw = AsyncMiddleWare();
    var add = function (req, next) {
      if (isNaN(req.sum))
        req.sum = 1;
      else
        req.sum++;
      next();
    }
    mw.use(add);
    mw.use(add, add, add);
    
    var start = mw.handler();
    start({}, function (req) {  
      console.log(req);
      req.sum.should.equal(4);
      done();
    });
  });
  
  it('#SyncMiddleWare', function () {
    var mw = SyncMiddleWare();
    var add = function (req) {
      if (isNaN(req.sum))
        req.sum = 1;
      else
        req.sum++;
    }
    mw.use(add);
    mw.use(add, add, add);
    
    var req = {}
    var start = mw.handler();
    start(req);
    
    console.log(req);
    req.sum.should.equal(4);
  });
  
});