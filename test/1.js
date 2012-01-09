var should = require('should');
var path = require('path');
var qw = path.resolve(__dirname, '..');
var web = require(qw);

describe('load QuickWeb', function () {
	it('require("' + qw + '") should return an Object.', function(){
		(typeof web).should.equal('object');
	});
});

