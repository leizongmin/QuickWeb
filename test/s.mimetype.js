var should = require('should');
var Service = require('../lib/Service');


describe('Service MIME-Type', function () {

  var mimetype = Service.import('mimetype');
  
  // 获取MIME类型
  it('#get', function () {
    mimetype.get('html').should.equal('text/html');
    mimetype.get('.html').should.equal('text/html');
    mimetype.get('bmp').should.equal('image/bmp');
    mimetype.get('.bmp').should.equal('image/bmp');
  });
  
  // 自定义MIME类型
  it('#set', function () {
    mimetype.set('xxoo', 'application/xxoo');
    mimetype.set('.ooxx', 'application/ooxx');
    mimetype.get('xxoo').should.equal('application/xxoo');
    mimetype.get('.xxoo').should.equal('application/xxoo');
    mimetype.get('ooxx').should.equal('application/ooxx');
    mimetype.get('.ooxx').should.equal('application/ooxx');
  });

});