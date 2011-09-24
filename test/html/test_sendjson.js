test('sendJSON()', function () {
	var data = {
		a:	'fdfdfdsffgkl;dfkgkdfl',
		b:	Math.random(),
		c:	new Date().getTime()
	}
	stop();
	$.getJSON('/sendjson', data, function (d) {
		start();
		for (var i in d)
			ok(d[i] == data[i], i + ' = ' + d[i]);
	});
})