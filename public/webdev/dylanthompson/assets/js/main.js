//stuff you can mess with
var intros = [
	'you know it\'s ya boy',
	'gamecocks quarterback',
	'the one and only',
	'DJ',
	'smell pomade? it\'s probably',
	'heavy metal music star',
	'united states president',
	'maybe it\'s maybelline, maybe it\'s',
	'need to cut a tree down? call'
]

var baseTitle = 'Dylan Thompson';

var tumblrUrl = 'pugsandrockandroll';

//list of file names
var photos = [
	
];

//stuff you shouldn't mess with
var pages = {blog: true, work: true, home: true, shop: true, contact: true};

//angular 
var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		templateUrl: 	'pages/landing.html',
		controller: 	'landingCtrl'
	});
	
	$routeProvider.when('/:path', {
		templateUrl: function(params) {
			var path = params.path.toLowerCase();
			
			return 'pages/' + (pages[path] ? path : '404') + '.html';
		},
		controller: function($scope, $rootScope, $routeParams, $controller) {
			var path = $routeParams.path.toLowerCase();
			
			$rootScope.title = path[0].toUpperCase() + path.substring(1) + ' - ' + baseTitle;
			
			if(pages[path]) $controller(path + 'Ctrl', {$scope: $scope});
		}
	});
	
	$routeProvider.otherwise('/');
	
	//$locationProvider.html5Mode(true);
});

app.controller('baseCtrl', function() {});

app.controller('landingCtrl', function($rootScope) {
	//hide the bar at the top
	$rootScope.hideHeader = true;
	
	//random intros
	document.getElementById('intro').innerHTML = intros[Math.floor(Math.random() * intros.length)];
	
	console.log(intros);

	//setting up the carousel
});

/* home.html */
app.controller('homeCtrl', function() {
});

/* blog.html */
app.controller('blogCtrl', function($http) {
	//why do I have to do this?
	var script = document.getElementById('external');
	script.src = 'http://' + tumblrUrl + '.tumblr.com/js';
});

/* work.html */
app.controller('workCtrl', function() {});

/* shop.html */
app.controller('shopCtrl', function() {});

/* contact.html */
app.controller('contactCtrl', function() {
	
});