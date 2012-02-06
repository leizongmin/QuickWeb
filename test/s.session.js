var should = require('should');
var Service = require('../lib/Service');
var fs = require('fs');
var path = require('path');

describe('service.session', function () {

  var session = Service.import('session');
  var data = {a: Math.random(), b: Math.random()}
  
  it('#create', function (done) {
    session.create('123456', 'file', {}, function (err, s) {
      should.equal(err, null);
      console.log(s);
      s.set.should.be.a('function');
      s.get.should.be.a('function');
      s.destory.should.be.a('function');
      s.hold.should.be.a('function');
      s.data.should.be.a('object');
      s.id.should.be.a('string');
      s.id.should.equal('123456');
      s.data.should.eql({});
      
      // set
      s.set(data, function (err) {
        should.equal(err, null); 
        done();
      });
    });
  });
  
  it('#get', function (done) {
    session.create('123456', 'file', {}, function (err, s) {
      console.log(data);
      should.equal(err, null);
      s.data.should.eql(data);
      done();
    });
  });
  
  it('#destory', function (done) {
    session.create('123456', 'file', {}, function (err, s) {
      should.equal(err, null);
      var filename = path.resolve(s.session.path, 'qws_123456');
      s.destory(function (err) {
        should.equal(err, null);
        path.existsSync(filename).should.equal(false);
        done();
      });
    });
  });
  
});