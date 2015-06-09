var app = angular.module('mainApp', ['ngRoute']);

app.run(function($rootScope) {
	$rootScope.projects = {};
	
	$rootScope.projects.programs = [
		['space', 'space.png', 'spacegame']
	];
	
	$rootScope.projects.webdev = [
		['Isaac Quick Reference', 'space.png', 'isaac'],
		['GMOD Prime', 'space.png', 'gmp'],
		['We The Broken', 'space.png', 'wtb']
	];
	
	$rootScope.projects.designs = [
		['space', 'space.png', 'space']
	];
});

/*

:( - need express/node

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		controller: function($scope) {
		}
	});
	
	$routeProvider.when('/project/*', {
		templateUrl: 'project.html'
	});
	
	$locationProvider.html5Mode(true);
});

*/