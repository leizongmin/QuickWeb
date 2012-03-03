var should = require('should');
var Service = require('../lib/Service');
var path = require('path');
var tool = Service.import('tool');


describe('Service tool', function () {

  it('#md5', function () {
    tool.md5('123456').should.equal('e10adc3949ba59abbe56e057f20f883e');
    tool.md5('abcdefg').should.equal('7ac66c0f148de9519b8bd264312c4d64');
  });

  it('#relativePath', function () {
    tool.relativePath('/test', '/test/a').should.equal('a');
    tool.relativePath('/test', '/test/a/').should.equal('a/');
    tool.relativePath('/test', '\\test\\a').should.equal('a');
  });
  
  it('#requireWithContext', function () {
    var a = tool.requireWithContext(path.resolve(__dirname, 'lib/rm.js'), {}, module);
    var b = tool.requireWithContext(path.resolve(__dirname, 'lib/rm.js'), {});
    var c = tool.requireWithContext(path.resolve(__dirname, 'lib/rm.js'));
  });
  
  it('#requireFile no cache', function () {
    var a = tool.requireFile(path.resolve(__dirname, 'requirefile.module'));
    var b = tool.requireFile(path.resolve(__dirname, 'requirefile.module'));
    a.value.should.not.equal(b.value);
  });
  
  it('#requireFile specified context', function () {
    var v = 123456;
    var a = tool.requireFile(path.resolve(__dirname, 'requirefile.module'), {}, module);
    var b = tool.requireFile(path.resolve(__dirname, 'requirefile.module'), {contextValue: v}, module);
    a.value.should.not.equal(b.value);
    a.contextValue.should.equal(0);
    b.contextValue.should.equal(v * 10);
    var c = require('./requirefile2');
    c.count.should.equal(1);
  });
  
  it('#bufferArray', function () {
    var a = tool.bufferArray();
    a.add(new Buffer('a')).should.equal(true);
    a.add('b').should.equal(true);
    a.add(new Buffer('c')).should.equal(true);
    a.add(1).should.equal(false);
    a.length.should.equal(3);
    a.toBuffer().should.eql(new Buffer('abc'));
    a._cache.should.eql(new Buffer('abc'));
    a.add('d').should.equal(true);
    should.equal(a._cache, undefined);
    a.toBuffer().should.eql(new Buffer('abcd'));
    a.toString().should.equal('abcd');
  });
  
  it('#merge', function () {
    var a = {a: 123, b: 456}
    var b = {c: 456, d: 789}
    var c = {b: 654, e: 120}
    var ab = {a: 123, b: 456, c: 456, d: 789}
    var bc = {c: 456, d: 789, b: 654, e: 120}
    var ac = {a: 123, b: 654, e: 120}
    tool.merge(a, b).should.eql(ab);
    tool.merge(b, c).should.eql(bc);
    tool.merge(a, c).should.eql(ac);
  });
  
});