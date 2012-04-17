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
  
  it('#match *.xxx', function () {
    vhost.add('a.xxx.yy', 11123);
    vhost.add('*.xxx.yy', 45125);
    vhost.query('a.xxx.yy').should.equal(11123);
    vhost.query('b.xxx.yy').should.equal(45125);
    vhost.query('c.xxx.yy').should.equal(45125);
    should.equal(vhost.query('d.a.xxx.yy'), null);
    vhost.exists('a.xxx.yy').should.equal(true);
    vhost.exists('b.xxx.yy').should.equal(true);
    vhost.exists('c.xxx.yy').should.equal(true);
    vhost.exists('d.xx.xxx.yy').should.equal(false);
  });
  
});