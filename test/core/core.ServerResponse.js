var should = require('should');
var path = require('path');
var qw = path.resolve(__dirname, '../..');

delete require.cache[path.resolve(qw, 'core/ServerResponse.js')];
var response = require(path.resolve(qw, 'core/ServerResponse.js'));
var ServerResponse = response.ServerResponse;

describe('#ServerResponse', function () {
	// 载入ServerResponse模块，检查模块输出是否正确
	it('load module ServerResponse', function () {
		(typeof response).should.equal('object');
		(typeof response.addListener).should.equal('function');
		(typeof response.ServerResponse).should.equal('function');
		(typeof response.ServerResponse.prototype._listener).should.equal('object');
		response.ServerResponse.prototype._listener.header.should.be.an.instanceof(Array);
		response.ServerResponse.prototype._listener.data.should.be.an.instanceof(Array);
		(typeof response.ServerResponse.prototype.next).should.equal('function');
		(typeof response.ServerResponse.prototype.addListener).should.equal('function');
		response.addListener.should.equal(response.ServerResponse.prototype.addListener);
		(typeof response.ServerResponse.prototype.writeHead).should.equal('function');
		(typeof response.ServerResponse.prototype.write).should.equal('function');
		(typeof response.ServerResponse.prototype.end).should.equal('function');
		(typeof response.ServerResponse.prototype.setHeader).should.equal('function');
		(typeof response.ServerResponse.prototype.getHeader).should.equal('function');
		(typeof response.ServerResponse.prototype.removeHeader).should.equal('function');
		(typeof response.ServerResponse.prototype.addTrailers).should.equal('function');
		(typeof response.ServerResponse.prototype.hasResponse).should.equal('function');
	});
	
	// 创建一个实例
	it('new ServerResponse()', function () {
		var origin = {
			statusCode:		404
		}
		var req = new ServerResponse(origin);
		// 复制的属性是否正确
		req.origin.should.eql(origin);
		req.statusCode.should.equal(origin.statusCode);
		req._responseSize.should.equal(0);
		req._isoutput.should.equal(true);
		req.headers.should.eql({});
	});
	
	// 检查加入处理链顺序是否正确
	it('ServerResponse.addListener()', function () {
		function listener_1(req) {
			req.listenerQueue.push(1);
			req.next();
		}
		function listener_2(req) {
			req.listenerQueue.push(2);
			req.next();
		}
		function listener_3(req) {
			req.listenerQueue.push(3);
			req.next();
		}
		response.addListener('header', listener_1);
		response.addListener('header', listener_2);
		response.addListener('header', listener_3, true);
		response.addListener('data', listener_1);
		response.addListener('data', listener_2);
		response.addListener('data', listener_3, true);
		
		// 检查顺序
		ServerResponse.prototype._listener.header.length.should.equal(3);
		ServerResponse.prototype._listener.header[0].should.equal(listener_3);
		ServerResponse.prototype._listener.header[1].should.equal(listener_1);
		ServerResponse.prototype._listener.header[2].should.equal(listener_2);
		ServerResponse.prototype._listener.data.length.should.equal(3);
		ServerResponse.prototype._listener.data[0].should.equal(listener_3);
		ServerResponse.prototype._listener.data[1].should.equal(listener_1);
		ServerResponse.prototype._listener.data[2].should.equal(listener_2);
		
		// 是否顺序执行
		var res = new ServerResponse({});
		res.listenerQueue = [];
		res.onheaderready = function () {
			res.listenerQueue.should.eql([3,1,2]);
			res.next();
		}
		res.ondataready = function () {
			res.listenerQueue.should.eql([3,1,2,3,1,2]);
		}
		res.next();
	});
});