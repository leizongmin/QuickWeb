/**
 * QuickWeb start for npm install test
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.5
 */

// require QuickWeb module 
var web = require('./core/web');

// settings
web.set('home_path', './test/www');				// file path (file_server plus)
web.set('code_path', './test/code');				// code path (restful router plus)
web.set('template_path', './test/tpl');			// template path (render plus)
web.set('template_extname', 'html');				// template extname (render plus)

// register your template render
web.set('render_to_html', function (str, view) {
	return str;
});

// load all plus
web.loadPlus();

// create server and listening on port 80
var s = web.create(80);
