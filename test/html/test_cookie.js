/**
 * QuickWeb单元测试
 */
 
test('cookie', function () {
	stop();
	var a = Math.random();
	var b = Math.random();
	$.get('/cookie', {a: a, b: b},  function (d) {
		var is_start = /start/.test(d);
		start();
		ok(is_start, 'cookie测试开始');
		if (is_start) {
			stop();
			$.get('/cookie', function (d) {
				var cookie_a = d.indexOf(a) >= 0 ? true : false;
				var cookie_b = d.indexOf(b) >= 0 ? true : false;
				start();
				ok(cookie_a, 'Cookie A正常');
				ok(cookie_b, 'Cookie B正常');
			});
		}
	});
});

