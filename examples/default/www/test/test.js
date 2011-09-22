/**
 * QuickWeb单元测试
 */
 
test('cookie', function () {
	stop();
	$.get('/cookie', function () {
		$.get('/cookie', function (d) {
			var cookie_a = /cookie_a = fsdgdfgdfgdf/.test(d);
			var cookie_b = /cookie_b = fdfgdfgdfsgdf/.test(d);
			start();
			ok(cookie_a, 'Cookie A正常');
			ok(cookie_b, 'Cookie B正常');
		});
	});
});

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
