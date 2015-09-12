//angular setup
var app = angular.module('app', []).run(function($rootScope) { $rootScope.locals = locals; });

//angular stuff
app.controller('ctrl', function($scope) {
	//project window
	var modal = document.getElementById('modal');
	
	$scope.popup = function(project) {
		console.log('aaa');
		
		modal.style.display = 'block';
	}
});

//normal stuff
document.addEventListener('DOMContentLoaded', function() {
	//sticky header
	
	//don't have to get these every scroll
	var header = document.getElementsByTagName('header')[0];
	var page = document.getElementsByClassName('page')[0];
	var links = document.querySelectorAll('nav a');

	window.addEventListener('scroll', function(e) {		
		//stupid firefox
		var scroll = (document.body.scrollTop || document.documentElement.scrollTop);
		var threshold = page.offsetHeight - header.offsetHeight;

		if(scroll >= threshold)
			header.classList.add('sticky');
		else
			header.classList.remove('sticky');
		
		//link highlighting
		scroll = targetY === false ? scroll : targetY;
		
		for(var i = 0; i < links.length; i++) {
			var link = links[i];
			
			var elem = getElem(link.attributes.href.value);
			
			if(scroll >= elem.offsetTop && scroll < elem.offsetTop + elem.offsetHeight)
				link.classList.add('active');
			else
				link.classList.remove('active');
		}
	});
	
	//smooth anchor scrolling
	
	//dom element from #id
	
	var getElem = function(id) {
		return document.getElementById(id.substr(1));
	}
	
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
	if(window.location.hash)
		window.scroll(0, getElem(window.location.hash).offsetTop);
	
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
		
		//what the fuck javascript
		var id = elem.attributes.id.value;
		
		elem.attributes.id.value = '';
		
		window.location.hash = '#' + id;
		
		elem.attributes.id.value = id;
		
		if(!running)
			requestAnimationFrame(doScroll);
	}
});