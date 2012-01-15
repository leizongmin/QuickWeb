var should = require('should');
var Service = require('../lib/Service');

describe('service.renderer', function () {

  var ejsrenderer = Service.import('renderer.ejs');
  var renderer = Service.import('renderer');

  // ‰÷»æ
  it('#render', function () {
    var tpl = 'Hello, <%=name%>!';
    var data = {name: 'QuickWeb'}
    renderer.render('ejs', tpl, data)
      .should.equal(ejsrenderer.render(tpl, data));
  });
  
  // ≈‰÷√
  it('#config', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf).should.eql(ejsrenderer.config(conf));
    renderer.config('ejs').should.eql(conf);
    ejsrenderer.config(conf).should.eql(conf);
  });
  
  // ‰÷»æ
  it('#render', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var tpl = 'Hello, {{name}}';
    var data = {name: 'QuickWeb'}
    renderer.render('ejs', tpl, data)
      .should.equal(ejsrenderer.render(tpl, data));
  });
  
  // ±‡“Î
  it('compile', function () {
    var conf = {open: '{{', close: '}}'}
    renderer.config('ejs', conf);
    var tpl = 'Hello, {{name}}';
    var data = {name: 'QuickWeb'}
    var f1 = renderer.compile('ejs', tpl);
    var f2 = ejsrenderer.compile(tpl);
    f1(data).should.equal(f2(data));
  });
  
});