exports.path = '/';

exports.get = function (request, response, next) {
	//response.renderFile('index.html', {title: 'Just For Test', content: 'Hello, hahaha.'});
	//response.renderFile('index.js', {name: 'test', text: 'wahaha'});
	response.sendError(500, 'ddddddddd\ngfgf\n\nggggggggggggggg');
}