/**
 * QuickWeb start for npm install test
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.6
 */

// require QuickWeb module 
var web = require('./core/web');

// setting logger level
web.setLoggerLevel(2);

// settings
web.set('home_path', './examples/default/www');			// file path (file_server plus)
web.set('code_path', './examples/default/code');			// code path (restful router plus)
web.set('template_path', './examples/default/tpl');		// template path (render plus)
web.set('template_extname', 'html');						// template extname (render plus)

// register your template render
web.set('render_to_html', function (str, view) {
	return str;
});

// create server and listening on port 80
var s = web.create(80);