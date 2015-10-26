/*
TODO:
	csrf contact form?
*/

//angular setup
var app = angular.module('app', []).run(function($rootScope) { $rootScope.locals = locals; $rootScope.initTime = Date.now() });

//util functions
//dom element from #id
var getElem = function(id) {
	return document.getElementById(id.match(/[#/]([^/]+)/)[1]);
}

//who needs angular routing
var getPath = function() {
	if(window.history.replaceState)
		return window.location.pathname;
	else
		return window.location.hash;
}

var setPath = function(path) {
	if(path == getPath().substr(1)) return;
	
	//proper argument looks like "webdev/isaac"
	//path = path.match(/\/?(.+)/)[1];
	
	var parts = path.split('/');
	
	//hopefully we'll have html5
	if(window.history.replaceState)
		window.history.replaceState({}, '', '/' + path);
	else
		if(path == '/')
			window.location.hash = '';
		else
			window.location.hash = '#' + path;
}

//:roll eyes emoji:
var scrollEvent;

//for titles
var baseTitle = 'Andrew Ault';

//angular stuff
app.controller('ctrl', function($scope, $document, $http) {
	//add info to our projects
	for(var cat in $scope.locals.projects) {
		if($scope.locals.projects.hasOwnProperty(cat)) {
			var projects = $scope.locals.projects[cat];
			
			for(var name in projects) {
				if(projects.hasOwnProperty(name)) {
					var project = projects[name];

					project.info.cat  = cat;
					project.info.name = name;
					project.info.path = '/' + cat + '/' + name;
					
					project.curFile = 0;
				}
			}
		}
	}
	
	//project window
	var modal = document.getElementById('modal');
	
	$scope.popup = function(project, $event) {
		//make the popup
		$scope.curProject = project;
		modal.style.display = 'block';
		
		//change our location
		$scope.moveCarousel();
		
		//and our title
		$document[0].title = project.info.title + ' - ' + baseTitle;
	}
	
	$scope.hidePopup = function() {
		//close it
		delete $scope.curProject;
		modal.style.display = 'none';
		
		//reset location
		scrollEvent();
		
		//and our title
		$document[0].title = baseTitle;
	}
	
	$scope.moveCarousel = function(dir) {
		if(dir) {
			$scope.curProject.curFile += (dir / Math.abs(dir));

			if($scope.curProject.curFile < 0)
				$scope.curProject.curFile += $scope.curProject.info.files.length;
			else
				$scope.curProject.curFile = $scope.curProject.curFile % $scope.curProject.info.files.length;
		}
		
		var path = $scope.curProject.info.path.substr(1);
		
		if($scope.curProject.curFile)
			path += '/' + $scope.curProject.curFile;
		
		setPath(path);
	}
	
	
	//contact form submit
	$scope.email = $scope.body = '';
	
	$scope.validateEmail = function() {
		return $scope.email.search(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/gi) < 0;
	}
	
	$scope.submitForm = function() {
		if($scope.contacted) return;
		
		if(document.querySelectorAll('#contact .invalid').length > 0) {
			var inputs = document.querySelectorAll('#contact *[placeholder]');
			
			for(var i = 0; i < inputs.length; i++)
				inputs[i].classList.add('ng-touched');
			
			return;
		}
		
		$http.post('/contact', {
			email: 	$scope.email,
			body: 	$scope.body
		}).then(function() {
			$scope.response = 'Thanks!';
		}, function() {
			$scope.response = 'Error :(';
			$scope.contacted = false;
		});
		
		$scope.contacted = true;
	}
});

//normal stuff
document.addEventListener('DOMContentLoaded', function() {
	//sticky header
	//don't have to get these every scroll
	var header = document.getElementsByTagName('header')[0];
	var page = document.getElementsByClassName('page')[0];
	var links = document.querySelectorAll('nav a');
	var modal = document.getElementById('modal');
	
	scrollEvent = function(e) {		
		//stupid firefox
		var scroll = (document.body.scrollTop || document.documentElement.scrollTop);
		var threshold = page.offsetHeight - header.offsetHeight;

		if(scroll >= threshold)
			header.classList.add('sticky');
		else
			header.classList.remove('sticky');
		
		//link highlighting
		if(modal.style.display != 'block') {
			scroll = targetY === false ? scroll : targetY;

			for(var i = 0; i < links.length; i++) {
				var link = links[i];

				var elem = getElem(link.attributes.href.value);

				if(scroll >= elem.offsetTop && scroll < elem.offsetTop + elem.offsetHeight) {
					link.classList.add('active');

					if(i > 0)
						setPath(elem.attributes.id.value);
					else
						setPath('');
				} else
					link.classList.remove('active');
			}
		}
	}

	window.addEventListener('scroll', scrollEvent);
	
	//smooth anchor scrolling
	//hijack our anchor links
	var links = document.querySelectorAll('a[href*="#"]');
	
	for(var i = 0; i < links.length; i++) {
		var link = links[i];
		
		//this is hacky
		var target = getElem(link.attributes.href.value);
		
		(function(link, target) {
			link.onclick = function(e) {
				scrollTo(target);
				
				return false;
			}
		})(link, target);
	}
	
	//our actual scroll animation
	var targetY = false;
	var running = false;
	
	//keep support for anchors
	var path = getPath().substr(1);
	
	if(path) {
		var parts = path.split('/');
		
		//+ 1 just to make sure the header gets styled
		var cat = getElem('/' + parts[0]);
		window.scroll(0, cat.offsetTop);
		scrollEvent();
		
		if(parts[1]) {
			var $scope = angular.element(cat).scope();
			var project = $scope.locals.projects[parts[0]][parts[1]];
			
			$scope.popup(project);
			
			if(parts[2]) {
				$scope.$apply(function() {
					project.curFile = Math.max(0, Math.min(project.info.files.length - 1, parseInt(parts[2])));

					$scope.moveCarousel();
				});
			} else
				$scope.$apply();
		}
	}
			
	
	//this worked better than I thought :)
	var doScroll = function() {
		running = true;
		
		var scroll = document.body.scrollTop || document.documentElement.scrollTop;
		
		var diff = (targetY - scroll) / 8;
		
		var dest = scroll + (diff < 0 ? Math.min(diff, -1) : Math.max(diff, 1));
		
		if(Math.abs(scroll - targetY) >= 1) {
			window.scroll(0, dest);
			
			requestAnimationFrame(doScroll);
		} else {
			window.scroll(0, targetY);
			
			targetY = false;
			running = false;
		}
	}
	
	//abstract it
	var scrollTo = function(elem) {
		targetY = elem.offsetTop;
		
		var id = elem.attributes.id.value;
		
		setPath(id);
		
		if(!running)
			requestAnimationFrame(doScroll);
	}
});

//setup for swiping
var ox, oy, isImage;

document.addEventListener('touchstart', function(e) {
	ox = e.touches[0].clientX;
	oy = e.touches[0].clientY;
	
	isImage = e.target.parentNode.classList.contains('image');
});

document.addEventListener('touchmove', function(e) {
	if(!ox || !oy) return;
	
	var dx = e.touches[0].clientX - ox;
	var dy = e.touches[0].clientY - oy;
	
	var adx = Math.abs(dx);
	var ady = Math.abs(dy);
	
	var scope = angular.element(e.target).scope();
	
	//make sure our window is open
	if(document.getElementById('modal').style.display !== 'none') {
		//horizontal
		if(adx > ady) {
			if(adx > 50) {
				//only need this for changing images
				//if(!isImage) return;

				scope.moveCarousel(dx / adx);
				scope.$apply();
				
				ox = oy = isImage = null;
			}
		} else if(ady > 200) {
			//swipe down to close
			if(dy < 0) return;

			scope.hidePopup();
		}
	}

	ox = oy = isImage = null;
});