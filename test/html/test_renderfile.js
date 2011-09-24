test('renderFile()', function () {
	stop();
	var p = {
		num_1:	Math.random() + '',
		num_2:	Math.random() + ''
	}
	$.get('/renderfile', p, function (d) {
		start();
		ok(d.indexOf(p.num_1) >= 0, 'num_1 = ' + p.num_1);
		ok(d.indexOf(p.num_2) >= 0, 'num_2 = ' + p.num_2);
	});
})
