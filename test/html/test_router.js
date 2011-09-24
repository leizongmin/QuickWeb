test('RESTful router', function () {
	stop();
	var d = new Date();
	var p = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDay();
	$.get('/router/' + p, function (d) {
		start();
		ok(d.indexOf(p) >= 0, p);
	});
});