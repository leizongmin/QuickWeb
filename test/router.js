var router = require('../core/router');
var ret;
var callback = function () { console.log('callback'); }

ret = router.register('get', '/:userid', callback);
ret = router.register('post', '/:userid/:password', callback);
ret = router.register('get', '/home/:user', callback);

var start = new Date().getTime();
for (i = 0; i < 10; i++) {
	ret = router.handler('get', '/lei');
	if (ret)
		console.log(ret);
	ret = router.handler('post', '/lei/123');
	if (ret)
		console.log(ret);
	ret = router.handler('get', '/home/f/');
	if (ret)
		console.log(ret);
}
var end = new Date().getTime();
console.log(i + '次用时' + (end - start) + 'ms');

for (i in router.handlers) ;
	// console.log(router.handlers[i]);
