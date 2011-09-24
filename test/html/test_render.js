test('render()', function () {
	stop();
	var p = {
		str:	'num_1={{num_1}},num_2={{num_2}}',
		num_1:	Math.random(),
		num_2:	Math.random()
	}
	$.get('/render', p, function (d) {
		start();
		var str = 'num_1=' + p.num_1 + ',num_2=' + p.num_2;
		ok(d.indexOf(str) >= 0, d);
	});
})