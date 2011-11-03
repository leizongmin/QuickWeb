var web = require('../core/web');

web.set('enable logger', true);
web.create();

// 输出debug, log, info, error, warn
web.logger.debug('Just for test');
web.logger.log('Just for test');
web.logger.info('Just for test');
// web.logger.error('Just for test');
web.logger.warn('Just for test');

process.exit();