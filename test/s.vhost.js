var should = require('should');
var Service = require('../lib/Service');
var Vhost = Service.import('vhost');


describe('Service vhost', function () {

  var vhost = Vhost.create();
  
  it('#add', function () {
    vhost.add('localhost', 12345);
    vhost.hostTable['localhost'].should.equal(12345);
  });
  
  it('#query', function () {
    vhost.query('localhost').should.equal(12345);
    should.equal(vhost.query('abc'), null);
  });
  
  it('#exists', function () {
    vhost.exists('localhost').should.equal(true);
    vhost.exists('cdef').should.equal(false);
  });
  
});