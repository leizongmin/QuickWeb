var should = require('should');
var Service = require('../lib/Service');
var mustache = require('mustache');

describe('service.renderer.mustache', function () {

  var renderer = Service.import('renderer.mustache');

  // ‰÷»æ
  it('#render', function () {
    var tpl = 'Hello, {{name}}!';
    var data = {name: 'QuickWeb'}
    renderer.render(tpl, data).should.equal(mustache.to_html(tpl, data));
    console.log(renderer.render(tpl, data));
    console.log(mustache.to_html(tpl, data));
  });
  
  // ±‡“Î
  it('#compile', function () {
    var tpl = 'Hello, {{name}}';
    var data = {name: 'QuickWeb'}
    var f = renderer.compile(tpl);
    f(data).should.equal(mustache.to_html(tpl, data));
    console.log(f(data));
    console.log(mustache.to_html(tpl, data));
  });
  
});