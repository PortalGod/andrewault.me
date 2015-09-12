var express = require('express'),
	fs 		= require('fs');

var app = module.exports = express();

app.use(express.static(__dirname + '/public'));

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
	}
	
	//coming soon
	for(var j = 0; j < list.length; j++)
		files[list[j]] = dir;
}

//real stuff
app.get('*', function(req, res) {
	//this is hacky but cheaper than a rendering engine (?)
	var body = fs.readFileSync('./public/home.html', {encoding: 'utf8'});
	
	var index = body.indexOf('<head>') + 6;
	
	res.write(body.substr(0, index));
	
	res.write('<script>var locals=' + JSON.stringify(locals) + '</script>');
	
	res.write(body.substr(index));
	
	res.end();
});


var server = app.listen(process.env.port || 80, function() {
	var addr = server.address();
	
	console.log('server started at', addr.address + ':' + addr.port);
});