
/* Globally defined Pokenest variables */
var pokemap = undefined;
var sitemap = undefined;
var modalCurrentLocation = undefined;
var modalLocationMarker = undefined;
var currentLocationMarker = undefined;
var nestMarkers = [];
var markerData = {};

var selectedMarkerID = undefined;

/* Settings */
// var followUser = false;
// var privileged = false;
// var password = "";

/* Define sprite sheet dimensions for image compression */
var pokemon_sprites = {
  normal: {
    columns: 12,
    icon_width: 30,
    icon_height: 30,
    sprite_width: 360,
    sprite_height: 390,
    filename: 'static/icons-sprite.png',
    name: 'Normal'
  },
  highres: {
    columns: 7,
    icon_width: 65,
    icon_height: 65,
    sprite_width: 455,
    sprite_height: 1430,
    filename: 'static/icons-large-sprite.png',
    name: 'High-Res'
  }
};

$( document ).ready(function() {

	// material design startup
	$.material.init()
    
    // pokemon nest map
	pokemap = L.map('mapid', {
		zoomControl: false, 
		center: [29.7604, -95.3698],
		zoom: 10
	});

	// modal map used to select and submit a new nest location
	sitemap = L.map('sitemapid', {
		zoomControl: false, 
		center: [29.7604, -95.3698],
		zoom: 10
	});

	sitemap.doubleClickZoom.disable(); 

	// add additional easy buttons to leaflet map
	L.easyButton({
		position: 'topright', 
		states:[{
			onClick: function() {
				
				/* Load any saved settings from cookies */
				var follow = getCookie("follow");
				var access = getCookie("access");
				var passwd = getCookie("passwd");
				console.log("follow-cookie: '" + follow + "'");
				console.log("access-cookie: '" + access + "'");
				console.log("passwd-cookie: '" + passwd + "'");

				if (follow == "") {
					$('#follow-setting').prop( "checked" , false);
				} else {
					if (follow == "true") {
						$('#follow-setting').prop( "checked" , true);
					} else {
						$('#follow-setting').prop( "checked" , false);
					}
				}

				if (access == "") {
					$('#access-setting').prop( "checked" , false);
				} else {

					if (access == "true") {
						$('#access-setting').prop( "checked" , true);

						$('#access-password').show();
						if (passwd == "") {
							$('#access-password').val("");
						} else {
							$('#access-password').val(passwd);
						}

					} else {
						$('#access-setting').prop( "checked" , false);
						$('#access-password').val("");
					}
				}
					
				$("#mySettingsModal").modal();
			},
			icon:'<i class="material-icons">settings</i>'
		}]
	}).addTo(pokemap);

	L.easyButton({
		position: 'topright', 
		states:[{
			onClick: function() {
				console.log("finding current location...");
				locate();
			},
			icon:'<i class="material-icons">my_location</i>'
		}]
	}).addTo(pokemap);

	L.easyButton({
		position: 'topright', 
		states:[{
			onClick: function() {
				$("#myModal").modal();
			},
			icon:'<i class="material-icons">add_location</i>'
		}]
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

	// locate every nearby pokemon
	loadPokeRadar();

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
	setInterval(function() { loadPokeRadar(); }, 10000);

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

	$('#applysettingsbtn').on('click', function() {

		// apply user's selected settings
		// followUser = $('#follow-setting').prop( "checked" );
		
		setCookie("follow", $('#follow-setting').prop( "checked" ), 1);
		setCookie("access", $('#access-setting').prop( "checked" ), 1);

		if ($('#access-setting').prop( "checked" ) == true) {
			setCookie("passwd", $('#access-password').val(), 1);
		} else {
			setCookie("passwd", "", 1);
		}
		
		// hide the settings modal
		$('#mySettingsModal').modal('hide');
	});

	$('#removeEntryBtn').on('click', function() {

		var privileged = false;
		var cookie = getCookie("access");
		if (cookie == "true") {
			privileged = true;
		}

		var password = getCookie("passwd");
		var postParameters = {id: selectedMarkerID, password: password};
		if (privileged) {

			console.log(postParameters);
			$.post("/remove", postParameters, function(responseJSON){
				var responseObject = JSON.parse(responseJSON);
				console.log(responseObject);
	
				// TODO: pop some toast when request is processed
			}); 
		}

		$('#myMarkerModal').modal('hide');
	});

	$('#access-toggle').on('click', function() {

		var state = $('#access-setting').prop( "checked" );
		if (state == true) {
			$('#access-password').show(200);
		} else {
			$('#access-password').hide(200);
		}		
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

	/* Logic for location toggle */


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
    		var id = data.id;
    		var name = data.pokemon.toLowerCase();
    		var lat = parseFloat(data.lat);
    		var lng = parseFloat(data.lng);
    		var icon = L.icon({
    			// iconUrl: name + '.png',
    			iconUrl: 'http://www.pokestadium.com/sprites/diamond-pearl/' + name + '.png',
    			iconSize:     [96, 96], // size of the icon
    			iconAnchor:   [48, 48], // point of the icon which will correspond to marker's location
    			popupAnchor:  [-3, -20] // point from which the popup should open relative to the iconAnchor
			});

			var options = {
				icon: icon,
				id: id,
				pokemon: name
			}

    		var m = L.marker([lat, lng], options).addTo(pokemap).on('click', function() {
    
    			var pokemon = this.options.pokemon;
    			pokemon = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
    			var id = this.options.id;
    			console.log(id + " " + pokemon);
    			selectedMarkerID = id;

    			// show pokenest info modal
    			$('#markerdata-header').html(pokemon + " Pokenest Info");

    			var privileged = false;
    			var cookie = getCookie("access");
    			if (cookie == "true") {
    				privileged = true;
    			}

    			if (privileged) {
    				$('#removeEntryBtn').show();
    			} else {
    				$('#removeEntryBtn').hide();
    			}
    			$('#myMarkerModal').modal();
    		});

			// store additional marker data
			// var googleMapsLink = "http://www.google.com/maps/place/" + data.lat + "," + data.lng;
    		// var pokevisionLink = "https://pokevision.com/#/@" + data.lat + "," + data.lng;
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

	var follow = false;
	var cookie = getCookie("follow");

	if (cookie != "") {
		if (cookie == "true") {
			follow = true;
		} 
	}

	if (follow == true) {
		pokemap.locate({setView: true, maxZoom: pokemap.getZoom()});
	} else {
		pokemap.locate({setView: false, maxZoom: 16});
	}
}

function onLocationFound(e) {
    var newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
    currentLocationMarker.setLatLng(newLatLng);
    console.log("user's current location: (" + newLatLng.lat + " ," + newLatLng.lng + ")");
}

function onLocationError(e) {
	console.log(e.message);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

