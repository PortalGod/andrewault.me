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

//list of file names
var photos = [
	
];


document.addEventListener('DOMContentLoaded', function() {
	//random intros
	document.getElementById('intro').innerHTML = intros[Math.floor(Math.random() * intros.length)];
	
	//setting up the carousel
	
	//first up, the dots
	var dots = document.getElementById('dots');
	
	for(var i = 0; i < 5; i++) {
		dots.appendChild(document.createElement('li'));
	}
});