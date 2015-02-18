var app = angular.module('mainApp', ['ngRoute']);

app.run(function($rootScope) {
	$rootScope.files = {
		design: [
			['rosie.png', 'Student Presidency Poster', 'abcd'],
			['rosie2.png', 'Student Presidency Poster', 'abcd']
		]
	}
});

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		controller: function($scope) {
		}
	});
	
	$locationProvider.html5Mode(true);
});