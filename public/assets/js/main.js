//angular setup
var app = angular.module('app', []).run(function($rootScope) { $rootScope.locals = locals; });

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

//angular stuff
app.controller('ctrl', function($scope, $window) {
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
		setPath(project.info.path.substr(1));
	}
	
	$scope.hidePopup = function() {
		//close it
		delete $scope.curProject;
		modal.style.display = 'none';
		
		//reset location
		scrollEvent();
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
		
		console.log(parts);
		
		var cat = getElem('/' + parts[0]);
		window.scroll(0, cat.offsetTop);
		
		if(parts[1]) {
			console.log(parts[1]);
			
			for(var i = 0; i < cat.children[0].children.length; i++) {
				var project = cat.children[0].children[i];
				
				if(project.attributes['data-name'].value == parts[1])
					angular.element(project).triggerHandler('click');
			}
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