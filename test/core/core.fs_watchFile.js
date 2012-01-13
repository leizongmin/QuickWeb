var should = require('should');
var path = require('path');
var fs = require('fs');
var qw = path.resolve(__dirname, '../..');

var fs_watchFile = require(path.resolve(qw, 'core/fs_watchFile.js'));

describe('#fs_watchFile', function () {
	
	it('load module fs_watchFile', function () {
		(typeof fs_watchFile.list).should.equal('object');
		(typeof fs_watchFile.interval).should.equal('number');
		(typeof fs_watchFile.watchFile).should.equal('function');
		(typeof fs_watchFile.unwatchFile).should.equal('function');
	});
	
	var filename = path.resolve(__dirname, 'test_fs_watchFile.txt');
	fs.writeFileSync(filename, 'utf8', new Date().getTime().toString());
	
	it('watchFile()', function () {
		var callback = function () {
			
		}
		fs_watchFile.watchFile(filename, callback);
		console.log(fs_watchFile);
		fs_watchFile.list[filename].should.exists();
	});
});