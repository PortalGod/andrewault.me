var express 	= require('express'),
	fs 			= require('fs'),
	qs 			= require('querystring'),
	nodemailer 	= require('nodemailer');

var config 		= require('./config')

var app = module.exports = express();

//error handling
var handleErr = function(err) {
	throw err;
}

//automatically get all of our projects
var locals = {}
var files = {};

var dirs = ['designs', 'webdev', 'programs'];

//this sux
var pages = {about: true, contact: true};

for(var i = 0; i < dirs.length; i++) { pages[dirs[i]] = true }

//get the info for our files
var scrapeFiles = function() {
	locals.projects = {};
	files = {}

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
}

//hacky fake rendering engine
var appendHead = function(body, html) {
	var match = body.match(/<head>\s*?(?:<meta[^>]*>)/i);
	var index = match.index + match[0].length;

	return body.substr(0, index) + html + body.substr(index);
}

//real stuff
//shortcuts for files
app.get('/:project', function(req, res, next) {
	scrapeFiles();
	
	var project = req.params.project;
	var dir = files[project];
	
	if(dir && (dir == 'webdev' || locals.projects[dir][project].info.href)) {
		var path = '/' + dir + '/' + project;
		
		var body = fs.readFileSync('./public' + path + '/index.html', {encoding: 'utf8'});
		
		body = appendHead(body, '<base href="' + path + '/">');
		
		res.end(body);
	} else
		next();
});

//static files
app.use(express.static(__dirname + '/public', {index: false}));

//the main page
app.get('/:cat?/:project?/:file?', function(req, res, next) {
	scrapeFiles();
	
	if(req.params.cat) {
		if(!pages[req.params.cat] && !dirs[req.params.cat]) return next();
		
		if(req.params.project)
			if(!files[req.params.project]) return next();
	}
	
	var body = fs.readFileSync('./public/home.html', {encoding: 'utf8'});
	
	var body = appendHead(body, '<script>var locals=' + JSON.stringify(locals) + '</script>');
	
	res.end(body);
});

//404
app.get('*', function(req, res) {
	res.status(404).type('html').end('404');
});

//contact
var transporter = nodemailer.createTransport({
	host: 	'smtp-mail.outlook.com',
	secureConnection: false,
	port: 	587,
	tls: {
		ciphers: 'SSLv3'
	},
	auth: {
		user: config.emailUser,
		pass: config.emailPass
	}
});

app.post('/contact', function(req, res) {
	res.type('html');
	
	var body = '';
	
	req.on('data', function(chunk) {
		body += chunk;
		
		if(body.length > 1e6) {
			res.status(413).end();
			
			request.connection.destroy();
		}
	});
	
	req.on('end', function() {
		var post = JSON.parse(body);
		
		if(!post.email || !post.body) return res.status(413).end();
		
		transporter.sendMail({
			from: 		post.email,
			sender: 	post.email,
			to: 		config.toEmail,
			subject: 	'Contact form',
			text: 		post.body
		}, function(err, info) {
			if(err) {
				res.status(500).end();
				return handleErr(err);
			}
			
			console.log(info);
		
			res.status(200).end();
		});
	});
});

//start it up
var server = app.listen(process.env.port || 8080, function() {
	var addr = server.address();
	
	console.log('server started at', addr.address + ':' + addr.port);
});