/* todo
	prevent right click
	no background for text
*/

//stuff you can mess with
var intros = [
	'you know it\'s ya boy',
	'gamecocks quarterback',
	'the one and only',
	'DJ',
	'smell pomade? it\'s probably',
	'heavy metal music star',
	'united states president'
]

var baseTitle = 'Dylan Thompson';

var tumblrUrl = 'pugsandrockandroll';

//list of file names
var photos = [
	'andrew-photoshoot-1.jpg'
];

//stuff you shouldn't mess with
var pages = {blog: true, work: true, home: true, shop: true, contact: true};

//angular 
var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/:path?', {
		templateUrl: function(params) {
			var path = (params.path || 'home').toLowerCase();
			
			return '/pages/' + (pages[path] ? path : '404') + '.html';
		},
		controller: function($scope, $rootScope, $routeParams, $controller) {
			var path = ($routeParams.path || 'home').toLowerCase();
			
			$rootScope.title = path[0].toUpperCase() + path.substring(1) + ' - ' + baseTitle;
			
			if(pages[path]) $controller(path + 'Ctrl', {$scope: $scope});
		}
	});
	
	$routeProvider.otherwise('/');
	
	$locationProvider.html5Mode(true);
});

app.controller('baseCtrl', function() {});

/* home.html */
app.controller('homeCtrl', function() {
	//random intros
	document.getElementById('intro').innerHTML = intros[Math.floor(Math.random() * intros.length)];

	//setting up the carousel

	//first up, the dots
	var dots = document.getElementById('dots');

	for(var i = 0; i < 5; i++) {
		dots.appendChild(document.createElement('li'));
	}
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