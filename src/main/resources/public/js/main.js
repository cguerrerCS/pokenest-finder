
/* Globally defined Pokenest variables */
var pokemap = undefined;
var sitemap = undefined;
var modalCurrentLocation = undefined;
var modalLocationMarker = undefined;
var currentLocationMarker = undefined;
var nestMarkers = [];
var markerData = {};

$( document ).ready(function() {
    
	pokemap = L.map('mapid', {
		center: [29.7604, -95.3698],
		zoom: 10
	});

	sitemap = L.map('sitemapid', {
		zoomControl: false, 
		center: [29.7604, -95.3698],
		zoom: 10
	});

	sitemap.doubleClickZoom.disable(); 
	// sitemap.scrollWheelZoom.disable();

	// add additional easy buttons to leaflet map
	L.easyButton('<i class="material-icons">settings</i>', function() {
		console.log("pulling up settings menu...");
	}).addTo(pokemap);

	L.easyButton('<i class="material-icons">my_location</i>', function() {
		console.log("finding current location...");
		locate();
	}).addTo(pokemap);

	L.easyButton('<i class="material-icons">add_location</i>', function() {
		$("#myModal").modal();
	}).addTo(pokemap);

	// initialize information about user's current location
	update();

	// add a tile layer to our map
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'cguerrer.0ndip406',
    	accessToken: 'pk.eyJ1IjoiY2d1ZXJyZXIiLCJhIjoiY2lxdmlzYmgxMDAxM2Z2bThvcm9kNGx1YiJ9.GdNs-_3lu5C2HrTqEbYGWg'
	}).addTo(pokemap);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'cguerrer.0ndip406',
    	accessToken: 'pk.eyJ1IjoiY2d1ZXJyZXIiLCJhIjoiY2lxdmlzYmgxMDAxM2Z2bThvcm9kNGx1YiJ9.GdNs-_3lu5C2HrTqEbYGWg'
	}).addTo(sitemap);

	currentLocationMarker = L.circle([0, 0], 10, {
    	color: 'red',
    	fillColor: '#f03',
    	fillOpacity: 0.5
	}).addTo(pokemap);

	modalLocationMarker = L.circle([0, 0], 10, {
    	color: 'red',
    	fillColor: '#f03',
    	fillOpacity: 0.5,
    	zIndexOffset: 1000
	}).addTo(sitemap);


	/** bind the locationfound event to the function onLocationFound()
    in other words, tell Leaflet what to do once locate() is successful 
	**/
	pokemap.on('locationfound', onLocationFound);
	pokemap.on('locationerror', onLocationError);

	// locate every 2 seconds in a loop
	// setInterval(locate, 10000);

	    // user style location picker
    sitemap.on('move', function () {
		modalLocationMarker.setLatLng(sitemap.getCenter());
	});

    pokemap.on('moveend', function() { 
     	// console.log(pokemap.getBounds());
	});

	//Dragend event of map for update marker position
	sitemap.on('dragend', function(e) {

		// console.log("dragging")
		modalLocationMarker.setLatLng(sitemap.getCenter());

		setTimeout(function() { modalLocationMarker.setLatLng(sitemap.getCenter()); }, 500);

		// var cnt = sitemap.getCenter();
	 //    var position = modalLocationMarker.getLatLng();
		// lat = Number(position['lat']).toFixed(5);
		// lng = Number(position['lng']).toFixed(5);
		// console.log(position);
		
	});

	// by default, follow user
	setInterval(function() { update(); }, 2000);

	// find pokemon within viewport
	loadPokeRadar();
	// setInterval(function() { loadPokeRadar(); }, 5000);

	$('#submitbtn').on('click', function() {

		/* hide modal and post sighting to server */
		$('#myModal').modal('hide');

			/* get pokemon species from user input */
			var pokemon = $('#pokemon-modal-input').val();

			var pokemonLocation = modalLocationMarker.getLatLng()

			/* gather post parameters for server */
			var postParameters = {pokemon: pokemon, lat: pokemonLocation.lat, lng: pokemonLocation.lng};

			console.log("submitting sighting location");
			console.log(postParameters);

			// make sure that all parameters are set properly first!

			/* post info to server */
			$.post("/report", postParameters, function(responseJSON){

				// get responce object 
				var responseObject = JSON.parse(responseJSON);
				console.log(responseObject);
			}); 
	});

	$('#pokevision-btn').on('click', function() {

		// show pokevision modal with iframe
		console.log("loading pokevision iframe");

	});

	$('#myModal').on('show.bs.modal', function(){

		console.log("show modal");

		// clear previous user information information
		$('#pokemon-modal-input').val("");

		// adjust map sizing for modal
	    setTimeout(function() { sitemap.invalidateSize(); }, 500);

	    // get user's current recorded location
	    modalCurrentLocation = currentLocationMarker.getLatLng()

	    // adjust view to center on current location
	    sitemap.setView(currentLocationMarker.getLatLng(), 16);
	});

	/* autocomplete code for Pokemon name lookup */
	var substringMatcher = function(strs) {
	return function findMatches(q, cb) {
	  var matches, substringRegex;

	  // an array that will be populated with substring matches
	  matches = [];

	  // regex used to determine if a string contains the substring `q`
	  substrRegex = new RegExp(q, 'i');

	  // iterate through the pool of strings and for any string that
	  // contains the substring `q`, add it to the `matches` array
	  $.each(strs, function(i, str) {
	    if (substrRegex.test(str)) {
	      matches.push(str);
	    }
	  });

	  cb(matches);
	};
	};

	// list of pokemon for autocomplete

	var pokemon = [
		'Bulbasaur',
		'Ivysaur',
		'Venusaur', 
		'Charmander', 
		'Charmeleon', 
		'Charizard', 
		'Squirtle', 
		'Wartortle', 
		'Blastoise', 
		'Caterpie', 
		'Metapod', 
		'Butterfree', 
		'Weedle', 
		'Kakuna', 
		'Beedrill', 
		'Pidgey', 
		'Pidgeotto', 
		'Pidgeot', 
		'Rattata', 
		'Raticate', 
		'Spearow', 
		'Fearow', 
		'Ekans', 
		'Arbok', 
		'Pikachu', 
		'Raichu', 
		'Sandshrew', 
		'Sandslash', 
		'Nidoran♀', 
		'Nidorina', 
		'Nidoqueen', 
		'Nidoran♂', 
		'Nidorino', 
		'Nidoking', 
		'Clefairy', 
		'Clefable', 
		'Vulpix', 
		'Ninetales', 
		'Jigglypuff', 
		'Wigglytuff', 
		'Zubat', 
		'Golbat', 
		'Oddish', 
		'Gloom', 
		'Vileplume', 
		'Paras', 
		'Parasect', 
		'Venonat', 
		'Venomoth', 
		'Diglett', 
		'Dugtrio', 
		'Meowth', 
		'Persian', 
		'Psyduck', 
		'Golduck', 
		'Mankey', 
		'Primeape', 
		'Growlithe', 
		'Arcanine', 
		'Poliwag', 
		'Poliwhirl', 
		'Poliwrath', 
		'Abra', 
		'Kadabra', 
		'Alakazam', 
		'Machop', 
		'Machoke', 
		'Machamp', 
		'Bellsprout', 
		'Weepinbell',
		'Victreebel',
		'Tentacool', 
		'Tentacruel', 
		'Geodude', 
		'Graveler', 
		'Golem', 
		'Ponyta', 
		'Rapidash', 
		'Slowpoke', 
		'Slowbro', 
		'Magnemite', 
		'Magneton', 
		"Farfetch'd", 
		'Doduo', 
		'Dodrio', 
		'Seel', 
		'Dewgong', 
		'Grimer', 
		'Muk', 
		'Shellder', 
		'Cloyster', 
		'Gastly', 
		'Haunter', 
		'Gengar', 
		'Onix', 
		'Drowzee', 
		'Hypno', 
		'Krabby', 
		'Kingler', 
		'Voltorb', 
		'Electrode', 
		'Exeggcute', 
		'Exeggutor', 
		'Cubone', 
		'Marowak', 
		'Hitmonlee', 
		'Hitmonchan', 
		'Lickitung', 
		'Koffing', 
		'Weezing', 
		'Rhyhorn', 
		'Rhydon', 
		'Chansey', 
		'Tangela', 
		'Kangaskhan', 
		'Horsea', 
		'Seadra', 
		'Goldeen', 
		'Seaking', 
		'Staryu', 
		'Starmie', 
		'Mr. Mime', 
		'Scyther', 
		'Jynx', 
		'Electabuzz', 
		'Magmar', 
		'Pinsir', 
		'Tauros', 
		'Magikarp', 
		'Gyarados', 
		'Lapras', 
		'Ditto', 
		'Eevee', 
		'Vaporeon', 
		'Jolteon', 
		'Flareon', 
		'Porygon', 
		'Omanyte', 
		'Omastar', 
		'Kabuto', 
		'Kabutops', 
		'Aerodactyl', 
		'Snorlax', 
		'Articuno', 
		'Zapdos', 
		'Moltres', 
		'Dratini', 
		'Dragonair',
		'Dragonite', 
		'Mewtwo', 
		'Mew' 
	];

	$('#pokemon-typeahead .typeahead').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	},
	{
		name: 'pokemon',
		source: substringMatcher(pokemon)
	});

});

/* Locate all pokemon nests within current viewport */
function loadPokeRadar() {

	console.log("pokeradar search...");
	var bounds = pokemap.getBounds();

	var postParameters = {
		southWestLat: bounds._southWest.lat, 
		southWestLng: bounds._southWest.lng,
		northEastLat: bounds._northEast.lat, 
		northEastLng: bounds._northEast.lng
	}

	/* remove old pokenest markers */
	for (i = 0; i < nestMarkers.length; i++) { 
		var marker = nestMarkers[i];
		pokemap.removeLayer(marker)
	}
	nestMarkers = [];

	/* load in updated pokenest markers */
	$.post("/nearby", postParameters, function(responseJSON){

		/* get responce object */
		responseObject = JSON.parse(responseJSON);

		console.log(responseObject)
		
		/* parse results of response object */
		for (i = 0; i < responseObject.length; i++) { 
    		
    		data = responseObject[i];
    		var googleMapsLink = "http://www.google.com/maps/place/" + data.lat + "," + data.lng;
    		var pokevisionLink = "https://pokevision.com/#/@" + data.lat + "," + data.lng;
    		var id = data.id;
    		var name = data.pokemon.toLowerCase();
    		var lat = parseFloat(data.lat);
    		var lng = parseFloat(data.lng);
    		var icon = L.icon({
    			iconUrl: 'http://www.pokestadium.com/sprites/diamond-pearl/' + name + '.png',
    			iconSize:     [96, 96], // size of the icon
    			iconAnchor:   [48, 48], // point of the icon which will correspond to marker's location
    			popupAnchor:  [-3, -20] // point from which the popup should open relative to the iconAnchor
			});

    		var m = L.marker([lat, lng], {icon: icon}).addTo(pokemap).on('click', function() {
    			var data = markerData[this];
    			console.log(data);
    			// show pokenest info modal
    			$('#myMarkerModal').modal();
    		});

			// store additional marker data
			// data["pokevisionLink"] = pokevisionLink;
			// data["googleMapsLink"] = googleMapsLink;

			// cache marker data for later
			markerData[m] = data;

			// cache nest marker reference for later
			nestMarkers.push(m);
		}
	}); 
}

function locate() {
	pokemap.locate({setView: true, maxZoom: 16});
}

function update() {
	pokemap.locate({setView: false, maxZoom: 16});
}

function onLocationFound(e) {

    var newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
    currentLocationMarker.setLatLng(newLatLng);
    console.log("found user's location.")
    // console.log("current location: (" + currentLocation.lat + " ," + currentLocation.lng + ")");
}

function onLocationError(e) {
    alert(e.message);
}
