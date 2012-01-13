var should = require('should');
var path = require('path');
var qw = path.resolve(__dirname, '../..');

delete require.cache[path.resolve(qw, 'core/ServerRequest.js')];
var request = require(path.resolve(qw, 'core/ServerRequest.js'));
var ServerRequest = request.ServerRequest;

describe('#ServerRequest', function () {
	// 载入ServerRequest模块，检查模块输出是否正确
	it('load module ServerRequest', function () {
		(typeof request).should.equal('object');
		(typeof request.addListener).should.equal('function');
		(typeof request.ServerRequest).should.equal('function');
		request.ServerRequest.prototype._listener.should.be.an.instanceof(Array);
		(typeof request.ServerRequest.prototype.init).should.equal('function');
		(typeof request.ServerRequest.prototype.next).should.equal('function');
		(typeof request.ServerRequest.prototype.addListener).should.equal('function');
		request.addListener.should.equal(request.ServerRequest.prototype.addListener);
	});
	
	// 创建一个实例
	it('new ServerRequest()', function () {
		var origin = {
			method:		'GET',
			url:		'/test',
			headers:	{'X-Test': 'yes'},
			httpVersion:	'1.0',
			socket:		true
		}
		var req = new ServerRequest(origin);
		
		// 复制的属性是否正确
		req.origin.should.eql(origin);
		req.method.should.equal(origin.method);
		req.url.should.equal(origin.url);
		req.headers.should.eql(origin.headers);
		req.httpVersion.should.equal(origin.httpVersion);
		req.socket.should.equal(origin.socket);
	});
	
	// 检查加入处理链顺序是否正确
	it('ServerRequest.addListener()', function () {
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
		request.addListener(listener_1);
		request.addListener(listener_2);
		request.addListener(listener_3, true);
		
		// 检查顺序
		ServerRequest.prototype._listener.length.should.equal(3);
		ServerRequest.prototype._listener[0].should.equal(listener_3);
		ServerRequest.prototype._listener[1].should.equal(listener_1);
		ServerRequest.prototype._listener[2].should.equal(listener_2);
		
		// 是否顺序执行
		var req = new ServerRequest({});
		req.listenerQueue = [];
		req.onready = function () {
			req.listenerQueue.should.eql([3,1,2]);
		}
		req.next();
	});
});