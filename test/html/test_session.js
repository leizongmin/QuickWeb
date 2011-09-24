test('session', function () {
	stop();
	var get_num = function (text) {
		var m = text.match(/\d+/);
		if (m == null)
			return false;
		else
			return parseInt(m[0]);
	}
	$.get('/session', function (d) {
		var n1 = get_num(d);
		$.get('/session', function (d) {
			var n2 = get_num(d);
			start();
			equals(n1 + 1, n2, 'Session递增');
		});
	});
});
