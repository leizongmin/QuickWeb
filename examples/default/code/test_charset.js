/**
 * ×Ô¶¨Òåcharset
 *
 */
 
exports.paths = '/charset';

exports.get = function (server, request, response) {
	response.setHeader('Content-Type', 'text/html; charset=gb2312');
	response.end('charset=gb2312');
}