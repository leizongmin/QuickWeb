var should = require('should');
var Service = require('../lib/Service');
var fs = require('fs');
var path = require('path');

describe('service.renderer', function () {

  var ejsrenderer = Service.import('renderer.ejs');
  var renderer = Service.import('renderer');

  // 渲染
  it('#render', function () {
    var tpl = 'Hello, <%=name%>!';
    var data = {name: 'QuickWeb'}
    renderer.render('ejs', tpl, data)
      .should.equal(ejsrenderer.render(tpl, data));
  });
  
  // 配置
  it('#config', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf).should.eql(ejsrenderer.config(conf));
    renderer.config('ejs').should.eql(conf);
    ejsrenderer.config(conf).should.eql(conf);
  });
  
  // 渲染
  it('#render', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var tpl = 'Hello, {{=name}}';
    var data = {name: 'QuickWeb'}
    renderer.render('ejs', tpl, data)
      .should.equal(ejsrenderer.render(tpl, data));
  });
  
  // 编译
  it('#compile', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var tpl = 'Hello, {{=name}}';
    var data = {name: 'QuickWeb'}
    var f1 = renderer.compile('ejs', tpl);
    var f2 = ejsrenderer.compile(tpl);
    f1(data).should.equal(f2(data));
  });
  
  // 编译文件
  it('#compileFile', function (done) {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var f = '__render.txt';
    var tpl = 'Hello, {{=name}}';
    var data = {name: 'QuickWeb'}
    fs.writeFileSync(f, tpl);
    renderer.compileFile('ejs', f, function (err, render) {
      if (err)
        throw Error();
      console.log(render(data));
      render(data).should.equal(renderer.render('ejs', tpl, data));
      done();
    });
  });
  
  // 渲染文件
  it('#renderFile', function (done) {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var f = '__render.txt';
    var tpl = 'Hello, {{=name}}';
    var data = {name: 'QuickWeb'}
    fs.writeFileSync(f, tpl);
    renderer.renderFile('ejs', f, data, function (err, text) {
      if (err)
        throw Error();
      console.log(text);
      text.should.equal(renderer.render('ejs', tpl, data));
      fs.unlink(f);
      done();
    });
  });
  
  // 渲染文件 + 预处理
  it('#renderFile + preprocess', function (done) {
    renderer.config('ejs', {open: '<%', close: '%>', preprocess: true});
    var f = path.resolve(__dirname, 'template/layout.html');
    renderer.renderFile('ejs', f, {}, function (err, text) {
      if (err)
        throw err;
      console.log(text);
      text.indexOf('这是body').should.not.equal(-1);
      done();
    });
  });
  
});