var should = require('should');
var path = require('path');
var qw = path.resolve(__dirname, '../..');

delete require.cache[path.resolve(qw, 'core/ServerInstance.js')];
global.QuickWeb = {
	set:	function () {   },
	get:	function () {   }
}
var server = require(path.resolve(qw, 'core/ServerInstance.js'));
var ServerInstance = server.ServerInstance;

describe('#ServerInstance', function () {
	// 载入ServerInstance模块，检查模块输出是否正确
	it('load module ServerInstance', function () {
		(typeof server).should.equal('object');
		(typeof server.addListener).should.equal('function');
		(typeof server.ServerInstance).should.equal('function');
		server.ServerInstance.prototype._listener.should.be.an.instanceof(Array);
		(typeof server.ServerInstance.prototype.next).should.equal('function');
		(typeof server.ServerInstance.prototype.set).should.equal('function');
		(typeof server.ServerInstance.prototype.get).should.equal('function');
		server.ServerInstance.prototype.set.should.equal(global.QuickWeb.set);
		server.ServerInstance.prototype.get.should.equal(global.QuickWeb.get);
		(typeof server.ServerInstance.prototype.addListener).should.equal('function');
		server.addListener.should.equal(server.ServerInstance.prototype.addListener);
	});
	
	// 检查加入处理链顺序是否正确
	it('ServerInstance.addListener()', function () {
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
		server.addListener(listener_1);
		server.addListener(listener_2);
		server.addListener(listener_3, true);
		
		// 检查顺序
		ServerInstance.prototype._listener.length.should.equal(3);
		ServerInstance.prototype._listener[0].should.equal(listener_3);
		ServerInstance.prototype._listener[1].should.equal(listener_1);
		ServerInstance.prototype._listener[2].should.equal(listener_2);
		
		// 是否顺序执行
		var req = new ServerInstance({});
		req.listenerQueue = [];
		req.onready = function () {
			req.listenerQueue.should.eql([3,1,2]);
		}
		req.next();
	});
});