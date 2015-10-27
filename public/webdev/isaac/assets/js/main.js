var app = angular.module('mainApp', []);

/* app.config(function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}); */

app.run(function($rootScope, $q, $http, $location) {
	//items
	
	var all = {};
	var deferred = $q.defer();
	
	var amt = 0;
	
	var addAndCheck = function() {
		if(++amt >= 4)
			deferred.resolve();
	}
	
	$http.get('assets/data/items.xml').success(function(data) {
		var items = (new DOMParser()).parseFromString(data, 'text/xml').children[0];
		
		all.items = [];
		all.trinkets = [];
		
		for(var i = 0; i < items.children.length; i++) {
			var item = items.children[i];
			
			if(item.attributes.gfx) {
				var id = parseInt(item.id);
				
				var obj = {
					id: id,
					name: item.attributes.name.value,
					desc: item.attributes.description.value,
					type: item.tagName,
					special: (item.attributes.special ? 'yes' : 'no'),
					pool: [],
					prereq: (item.attributes.achievement ? item.attributes.achievement.value : 'default'),
					coins: (item.attributes.coins ? '+' + item.attributes.coins.value : 0),
					bombs: (item.attributes.bombs ? '+' + item.attributes.bombs.value : 0)
				};
				
				if(item.tagName == 'trinket') {
					id = all.trinkets.length + 1;
					obj.style = 'background:url(assets/img/trinkets.png) -' + (id % 9) * 64 + 'px -' + Math.floor(id / 9) * 64 + 'px / 576px;';
					obj.pool = ['consumable'];
					all.trinkets.push(obj);
				} else {
					id = all.items.length + 1;
					obj.style = 'background:url(assets/img/items.png) -' + (id % 19) * 64 + 'px -' + Math.floor(id / 19) * 64 + 'px / 1216px;';
					all.items.push(obj);
				}
			}
		}
	
		//item pools

		$http.get('assets/data/itempools.xml').success(function(data) {
			var items = (new DOMParser()).parseFromString(data, 'text/xml').children[0];

			for(var i = 0; i < items.children.length; i++) {
				var pool = items.children[i];
				var name = pool.attributes.Name.value;
				
				for(var j = 0; j < pool.children.length; j++) {
					var data = pool.children[j];
					
					for(var k = 0; k < all.items.length; k++) {
						var item = all.items[k];
						
						if(item.id == data.attributes.Id.value) {
							item.pool.push(' ' + name);
						}
					}
				}
			}
			
			for(var i = 0; i < all.items.length; i++) {
				var item = all.items[i];
				
				if(item.pool.length === 0) {
					item.pool.push('none?');
				}
			};
			
			addAndCheck();
		});
		
		//item data
		
		//based on https://github.com/oxguy3/coebot-www/blob/master/boiitemsarray.json
		
		$http.get('assets/data/itemdata.json').success(function(src) {
			var data = src.data;
			
			//items
			
			for(var i = 0; i < data.items.length; i++) {
				var info = data.items[i];
				
				for(var j = 0; j < all.items.length; j++) {
					var item = all.items[j];

					if(item.id == info[0]) {
						item.health = info[2];
						item.damage = info[3];
						item.tears = info[4];
						item.speed = info[5];
						item.range = info[6];
						item.shotspeed = info[7];
						item.tearheight = info[8];
						item.luck = info[9];
						item.effect = info[10].join('. ') + '.';
						
						break
					}
				}
			}
			
			//cards
			
			for(var i = 0; i < data.cards.length; i++) {
				var info = data.cards[i];
				
				for(var j = 0; j < all.cards.length; j++) {
					var card = all.cards[j];
					
					if(card.id == info[0]) {
						card.health = info[2];
						card.damage = info[3];
						card.tears = info[4];
						card.speed = info[5];
						card.range = info[6];
						card.shotspeed = info[7];
						card.tearheight = info[8];
						card.luck = info[9];
						card.effect = info[10];
						
						break
					}
				}
			}
			
			//trinkets
			
			for(var i = 0; i < data.trinkets.length; i++) {
				var info = data.trinkets[i];
				
				for(var j = 0; j < all.trinkets.length; j++) {
					var trinket = all.trinkets[j];
					
					if(trinket.id == info[0]) {
						trinket.health = info[2];
						trinket.damage = info[3];
						trinket.tears = info[4];
						trinket.speed = info[5];
						trinket.range = info[6];
						trinket.shotspeed = info[7];
						trinket.tearheight = info[8];
						trinket.luck = info[9];
						trinket.effect = info[10];
						
						break
					}
				}
			}
			
			//pills
			
			for(var i = 0; i < data.pills.length; i++) {
				var info = data.pills[i];
				
				for(var j = 0; j < all.pills.length; j++) {
					var pill = all.pills[j];
					
					if(pill.id == info[0]) {
						pill.health = info[2];
						pill.damage = info[3];
						pill.tears = info[4];
						pill.speed = info[5];
						pill.range = info[6];
						pill.shotspeed = info[7];
						pill.tearheight = info[8];
						pill.luck = info[9];
						pill.effect = info[10];
						
						break
					}
				}
			}
			
			//runes
			
			for(var i = 0; i < data.runes.length; i++) {
				var info = data.runes[i];
				
				for(var j = 0; j < all.runes.length; j++) {
					var rune = all.runes[j];
					
					if(rune.id == info[0]) {
						rune.health = info[2];
						rune.damage = info[3];
						rune.tears = info[4];
						rune.speed = info[5];
						rune.range = info[6];
						rune.shotspeed = info[7];
						rune.tearheight = info[8];
						rune.luck = info[9];
						rune.effect = info[10];
						
						break
					}
				}
			}
			
			addAndCheck();
		});
			
		addAndCheck();
	});
	
	//pocket items
	
	$http.get('assets/data/pocketitems.xml').success(function(data) {
		var items = (new DOMParser()).parseFromString(data, 'text/xml').children[0];
		
		all.cards = [];
		all.pills = [];
		all.runes = [];
		
		for(var i = 0; i < items.children.length; i++) {
			var item = items.children[i];
			
			var obj = {
				special: 'no',
				pool: ['consumable'],
				id: parseInt(item.id),
				name: item.attributes.name.value,
				desc: item.attributes.description ? item.attributes.description.value : '',
				prereq: item.attributes.achievement ? item.attributes.achievement.value : 'default'
			};
			
			if(item.tagName == 'rune') {
				var id = all.runes.length + 1;
				
				obj.style = 'background:url(assets/img/runes.png) -' + (id % 3) * 64 + 'px -' + Math.floor(id / 3) * 64 + 'px / 192px;';
				obj.type = 'rune';
				
				all.runes.push(obj);
			} else if(item.tagName == 'pilleffect') {
				var id = Math.floor(Math.random() * 8);
				
				obj.style = 'background:url(assets/img/pills.png) -' + (id % 3) * 64 + 'px -' + Math.floor(id / 3) * 64 + 'px / 192px;';
				obj.type = 'pill';
				
				all.pills.push(obj);
			} else if(obj.name !== "NULL") {
				var id = all.cards.length;
				
				obj.style = 'background:url(assets/img/cards.png) -' + (id % 6) * 64 + 'px -' + Math.floor(id / 6) * 64 + 'px / 384px;'
				obj.type = 'card';
				obj.coins = (id == 8 ? '+ 1' : 0);
				obj.bombs = (id == 8 ? '+ 1' : 0);
				
				all.cards.push(obj);
			}
		}
			
		addAndCheck();
	});
	
	//searching and clicking
	
	$rootScope.filter = '';
	
	$rootScope.updateSearch = function() {
		var filter = $rootScope.filter.toLowerCase();
		var items = document.getElementById('grid').children;
		
		for(var i = 0; i < items.length; i++) {
			var item = items[i];
			var name = item.innerHTML;
			
			if(filter.length > 0) {
				if(item.innerHTML.toLowerCase().search(filter) > -1)
					item.classList.remove('inactive');
				else
					item.classList.add('inactive');
			} else
				item.classList.remove('inactive');
		}
	}
	
	//clicking init
	
	$rootScope.clicked = false;
	
	document.body.onclick = function() {
		var clicked = document.getElementsByClassName('clicked')[0]

		if(clicked) clicked.classList.remove('clicked');

		$rootScope.clicked = false;
	}
	
	document.getElementsByTagName('main')[0].onclick = function(e) {
		e.stopPropagation();
	}
	
	//stats stuff
	
	$rootScope.strip = function(str) {
		return str ? str.replace('&', '') : '0';
	}
	
	$rootScope.color = function(str) {
		if(!str) return;
		
		str = str.toLowerCase();
		
		var char = str.charAt(0);
		
		if(char == '&' || str == 'familiar' || str == 'yes')
			return 'blue'
		else if(char == '+' || char == '*' || str == 'passive')
			return 'green'
		else if(char == '-' || char == '/' || str == 'active' || str == 'death')
			return 'red'
	}
	
	//tab stuff
	
	//why do I have to do this
	//if(!$location.hash()) $location.hash('').replace();
	
	var tabs = {all: 0, items: 1, cards: 2, trinkets: 3, pills: 4, runes: 5, misc: 6};
	
	$rootScope.setTab = function(tab) {
		$location.path(tab).replace();
	}
	
	$rootScope.isTab = function(tab) {
		return $location.path() == '/' + tab ? 'active' : false;
	}
	
	$rootScope.getTab = function(tab) {
		return tabs[$location.path().substr(1) || 'all'];
	}
	
	//after loading data
	
	deferred.promise.then(function() {
		//achievements

		$http.get('assets/data/achievements.xml').success(function(data) {
			var achievements = (new DOMParser()).parseFromString(data, 'text/xml').children[0];

			for(var i = 0; i < achievements.children.length; i++) {
				var achievement = achievements.children[i];
					
				for(var j = 0; j < all.items.length; j++) {
					var item = all.items[j];

					if(item.prereq == achievement.attributes.id.value) {
						item.prereq = achievement.attributes.desc.value;
					}
				}
					
				for(var j = 0; j < all.cards.length; j++) {
					var item = all.cards[j];

					if(item.prereq == achievement.attributes.id.value) {
						item.prereq = achievement.attributes.desc.value;
					}
				}
					
				for(var j = 0; j < all.trinkets.length; j++) {
					var item = all.trinkets[j];

					if(item.prereq == achievement.attributes.id.value) {
						item.prereq = achievement.attributes.desc.value;
					}
				}
					
				for(var j = 0; j < all.runes.length; j++) {
					var item = all.runes[j];

					if(item.prereq == achievement.attributes.id.value) {
						item.prereq = achievement.attributes.desc.value;
					}
				}
			}
			
			var merged = all.items.concat(all.cards).concat(all.trinkets).concat(all.pills).concat(all.runes).concat(all.misc);
			merged.pop();

			$rootScope.tabs = [
				['all', merged],
				['items', all.items],
				['cards', all.cards],
				['trinkets', all.trinkets],
				['pills', all.pills],
				['runes', all.runes],
				['challenges', []],
				['dice rooms', []],
				['misc', all.misc]
			];

			$rootScope.all = all;
		});
	});
});

app.directive('gridItem', function() {
	return {
		restrict: 'A',
		template: '',
		link: function(scope, elem, attr) {
			var item = elem[0];
			
			var id = parseInt(attr.id);
			
			//hover
			
			item.onmouseover = function() {
				if(scope.$root.clicked) return;
				
				scope.$root.curItem = scope.tabs[scope.getTab()][1][id];
				scope.$apply();
				
				var pos = item.style.backgroundPosition.match('(.*)px (.*)px');
				
				var big = document.getElementById('big');
				
				big.style.backgroundImage = item.style.backgroundImage;
				big.style.backgroundSize = (parseInt(item.style.backgroundSize) / 64) * 140 + 'px auto';
				big.style.backgroundPosition = (parseInt(pos[1]) / 64) * 140 + 'px ' + (parseInt(pos[2]) / 64) * 140 + 'px';
			}
			
			//click
			
			item.onclick = function() {
				var wasclicked = scope.$root.clicked;
				
				scope.$root.clicked = false;
				
				if(wasclicked && scope.$root.curItem == scope.tabs[scope.getTab()][1][id])
					this.classList.remove('clicked');
				else {
					var clicked = document.getElementsByClassName('clicked')[0]
					
					if(clicked) clicked.classList.remove('clicked');
					
					this.classList.add('clicked');
					
					this.onmouseover();
				
					scope.$root.clicked = true;
				}
			}
		}
	}
});