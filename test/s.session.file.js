var should = require('should');
var Service = require('../lib/Service');
var fs = require('fs');
var path = require('path');

describe('service.session.file', function () {

  var session = Service.import('session.file');
  var config = {path: process.cwd()}
  
  it('#config', function () {
    session.config({}).should.eql({path: '/tmp'});
    session.config(config).should.eql(config);
  });
  
  it('#get', function (done) {
    // 文件不存在，返回空对象
    session.get('abcdefg', config, function (err, data) {
      should.equal(err, null);
      data.should.eql({});
      // 文件存在
      var save = {a: Math.random(), b: Math.random()}
      fs.writeFileSync('qws_abccc', JSON.stringify(save));
      session.get('abccc', config, function (err, data) {
        should.equal(err, null);
        data.should.eql(save);
        fs.unlinkSync('qws_abccc');
        done();
      });
    });
  });
  
  it('#set', function (done) {
    var save = {a: Math.random(), b: Math.random()}
    session.set('123456', config, save, function (err) {
      should.equal(err, null);
      session.get('123456', config, function (err, data) {
        should.equal(err, null);
        data.should.eql(save);
        
        session.set('123456', config, process, function (err, data) {
          console.log(err.toString());
          err.should.instanceof(Error);
          done();
        });
      });
    });
  });
  
  it('#destory', function (done) {
    session.destory('123456', config, function (err) {
      should.equal(err, null);
      should.equal(path.existsSync('qws_123456'), false);
      done();
    });
  });
  
});