/**
 * QuickWeb
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var logger = require('./logger');
var debug = router.logger = function (msg) {
	logger.log('web', msg);
}

