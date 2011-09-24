test('sendFile()', function () {
	stop();
	$.get('/sendfile', function (d) {
		start();
		ok(/ok/i.test(d), d);
	});
});