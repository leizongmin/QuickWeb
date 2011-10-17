/**
 * QuickWeb start for npm install test
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.12
 */

// require QuickWeb module 
var web = require('./core/web');

// setting logger level
web.setLogLevel(3);

// settings
web.set({
	'home_path':		'./examples/default/html',		// file path (file_server plus)
	'code_path':		'./examples/default/code',		// code path (restful router plus)
	'template_path':	'./examples/default/tpl',		// template path (render plus)
	'template_extname':	'html'							// template extname (render plus)
});

// register your template render
web.set('render_to_html', function (str, view) {
	return str;
});

// create server and listening on port 80
web.create();

// register custom MIME-TYPE
web.setMimes('cool', 'text/html');