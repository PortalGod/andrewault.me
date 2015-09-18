var express = require('express'),
	fs 		= require('fs');

var app = module.exports = express();

//automatically get all of our projects
var locals = {
	projects: {}
}

var dirs = ['designs', 'webdev', 'programs'];
var files = {};

for(var i = 0; i < dirs.length; i++) {
	var dir = dirs[i];
	var list = fs.readdirSync('./public/' + dir);
	
	locals.projects[dir] = {}; //list;
	
	for(var j = 0; j < list.length; j++) {
		var project = list[j];
		
		if(list[j].indexOf('.') !== 0) {
			locals.projects[dir][project] = {
				info: JSON.parse(fs.readFileSync('./public/' + dir + '/' + project + '/info.json'))
			}
		}
		
		//for web dev
		files[project] = dir;
	}
}

//real stuff
//shortcuts for files
app.get('/:project', function(req, res, next) {
	var project = req.params.project;
	var dir = files[project];
	
	if(dir && (dir == 'webdev' || locals.projects[dir][project].info.type == 'web')) {
		var path = '/' + dir + '/' + project;
		
		var body = fs.readFileSync('./public' + path + '/index.html', {encoding: 'utf8'});
		
		var index = body.indexOf('<head>') + 6;
		
		res.write(body.substr(0, index));
		
		res.write('<base href="' + path + '/">');
		
		res.write(body.substr(index));
		
		res.end();
	} else
		next();
});

//static files
app.use(express.static(__dirname + '/public'));

//the main page
app.get('*', function(req, res) {
	//this is hacky but cheaper than a rendering engine (?)
	var body = fs.readFileSync('./public/home.html', {encoding: 'utf8'});
	
	var index = body.indexOf('<head>') + 6;
	
	res.write(body.substr(0, index));
	
	res.write('<script>var locals=' + JSON.stringify(locals) + '</script>');
	
	res.write(body.substr(index));
	
	res.end();
});

//404
app.get('*', function(req, res) {
	res.status(404).type('html').end('404');
});

//start it up
var server = app.listen(process.env.port || 8080, function() {
	var addr = server.address();
	
	console.log('server started at', addr.address + ':' + addr.port);
});