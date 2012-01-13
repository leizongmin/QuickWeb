var should = require('should');
var path = require('path');
var qw = path.resolve(__dirname, '../..');
var web = require(path.resolve(qw, 'core/web.js'));
var requestAddListener = require(path.resolve(qw, 'core/ServerRequest.js')).addListener;
var responseAddListener = require(path.resolve(qw, 'core/ServerResponse.js')).addListener;
var ServerRequest = require(path.resolve(qw, 'core/ServerRequest.js')).ServerRequest;
var ServerResponse = require(path.resolve(qw, 'core/ServerResponse.js')).ServerResponse;

describe('load QuickWeb', function () {
	// 判断模块输出是否正确
	it('load module web', function(){
		(typeof web).should.equal('object');
		(typeof web.version).should.equal('string');
		web.version.substr(0, 1).should.equal('v');
		global.QuickWeb.should.equal(web);
		
		(typeof web.log).should.equal('function');
		
		web.ServerResponse.should.equal(ServerResponse);
		web.ServerRequest.should.equal(ServerRequest);
		
		(typeof web.util).should.equal('object');
		web.util.md5('123456').should.equal('e10adc3949ba59abbe56e057f20f883e');
		(typeof web.util.ejs).should.equal('object');
		web.util.ejs.render('a=<%= v %>', {v: 'test'}).should.equal('a=test');
		
		(typeof web.create).should.equal('function');
		(typeof web.createHttp).should.equal('function');
		(typeof web.createHttps).should.equal('function');
		web.create.should.equal(web.createHttp);
		
		(typeof web._config).should.equal('object');
		(typeof web.set).should.equal('function');
		(typeof web.get).should.equal('function');
		(typeof web.loadConfig).should.equal('function');
		(typeof web.use).should.equal('function');
		(typeof web.init).should.equal('function');
		
	});
});
