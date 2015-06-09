var app = angular.module('mainApp', []);

app.config(function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
});

app.run(function($rootScope, $q, $http, $location) {
	var files = ['items.xml', 'challenges.xml', 'pocketitems.xml']; //unpacked files
	var xml = new DOMParser(); //our parser
	var deferred = $q.defer(); //our promise
	
	var amt = 0;
	var done = function() {
		if(++amt >= files.length)
			deferred.resolve();
	}
	
	$rootScope.all = {};
	$rootScope.order = {'all': 0, 'items': 1, 'trinkets': 2, 'cards': 3, 'runes': 4, 'pills': 5, 'challenges': 6}
	
	var keys = {
		passive: 'items',
		familiar: 'items',
		active: 'items',
		trinket: 'trinkets',
		challenge: 'challenges',
		card: 'cards',
		rune: 'runes',
		pilleffect: 'pills'
	}
	
	var fieldinfo = {
		items: {
			size: [19, 1216],
			id: 1
		},
		trinkets: {
			size: [9, 576],
			id: 1
		},
		challenges: {
			size: [5, 320],
			id: 0
		},
		cards: {
			size: [6, 384],
			id: 0
		},
		runes: {
			size: [3, 192],
			id: 1
		},
		pills: {
			size: [3, 192],
			id: 0
		}
	}
	
	for(var i = 0; i < files.length; i++) {
		$http.get('assets/data/' + files[i]).success(function(data) {
			var tree = xml.parseFromString(data, 'text/xml').children[0];
			
			var index = 0;
			
			for(var j = 0; j < tree.children.length; j++) {
				var node = tree.children[j];
				var name = node.nodeName.toLowerCase();
				var key = keys[name];
				
				if(key == 'items' && !node.attributes.gfx) {
					continue
				}
				
				var info = fieldinfo[key];				
				var id = parseInt(node.id);
				
				var obj = {}
				
				if(name != 'challenge') {
					//coins etc
				}
				
				obj.style = 'background:url(assets/img/' + key + '.png) -' + (info.id % info.size[0]) * 64 + 'px -' + Math.floor(info.id / info.size[0]) * 64 + 'px / ' + info.size[1] + 'px';
				
				for(var k = 0; k < node.attributes.length; k++) {
					var attr = node.attributes[k];
					
					obj[attr.name] = attr.value;
				}
				
				$rootScope.all[key] = $rootScope.all[key] || [];
				$rootScope.all[key][id] = obj;
				
				info.id++;
			}
			
			done();
		});
	}
	
	//after the basics get loaded
	
	deferred.promise.then(function() {
		$http.get('assets/data/itempools.xml').success(function(data) {
			var tree = xml.parseFromString(data, 'text/xml').children[0];
			
			for(var i = 0; i < tree.children.length; i++) {
				var pool = tree.children[i];
				
				for(var j = 0; j < pool.children.length; j++) {
					var item = pool.children[j];
					var id = item.attributes.Id.value;
					
					$rootScope.all.items[id].pools = $rootScope.all.items[id].pools || [];
					$rootScope.all.items[id].pools.push(pool.attributes.Name.value);
				}
			}
		});
		
		$rootScope.all.all = $rootScope.all.items.concat(
			$rootScope.all.trinkets,
			$rootScope.all.trinkets, 
			$rootScope.all.challenges,
			$rootScope.all.cards, 
			$rootScope.all.runes, 
			$rootScope.all.pills
		);
	});
	
	//tabs
	
	$rootScope.setTab = function(tab) {
		$location.hash(tab);
	}
	
	$rootScope.getTab = function() {
		return $location.hash() || 'all';
	}
	
	$rootScope.isTab = function(tab) {
		return $location.hash() == tab ? 'active' : false;
	}
});

app.directive('gridItem', function() {
	return {
		restrict: 'A',
		template: '',
		link: function(scope, elem, attr) {
			var item = elem[0];
			var big = document.getElementById('big');
			
			item.onmouseover = function() {				
				scope.$root.curItem = scope.all[scope.getTab()][item.id];
				scope.$apply();
				
				var pos = item.style.backgroundPosition.match('(.*)px (.*)px');
				
				big.style.backgroundImage = item.style.backgroundImage;
				big.style.backgroundSize = (parseInt(item.style.backgroundSize) / 64) * 140 + 'px auto';
				big.style.backgroundPosition = (parseInt(pos[1]) / 64) * 140 + 'px ' + (parseInt(pos[2]) / 64) * 140 + 'px';
			}
		}
	}
});