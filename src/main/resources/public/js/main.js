
/* Globally defined Pokenest variables */
var pokemap = undefined;
var sitemap = undefined;
var modalCurrentLocation = undefined;
var modalLocationMarker = undefined;
var currentLocationMarker = undefined;
var nestMarkers = [];
var selectedMarkerID = undefined;

var realProgress = 0;
var progress = 0;

var initialLocationFound = false;

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
	sitemap.scrollWheelZoom.disable();

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
						$('#access-password').hide();
						$('#access-setting').prop( "checked" , false);
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
	// loadPokeRadar();

	// user style location picker
    sitemap.on('move', function () {
		modalLocationMarker.setLatLng(sitemap.getCenter());
	});

    pokemap.on('moveend', function() { 
     	// console.log(pokemap.getBounds());
     	setTimeout(function() { modalLocationMarker.setLatLng(sitemap.getCenter()); }, 500);
	});

	//Dragend event of map for update marker position
	sitemap.on('dragend', function(e) {

		// console.log("dragging")
		modalLocationMarker.setLatLng(sitemap.getCenter());

		setTimeout(function() { modalLocationMarker.setLatLng(sitemap.getCenter()); }, 500);

		// var cnt = sitemap.getCenter();
	 	// var position = modalLocationMarker.getLatLng();
		// lat = Number(position['lat']).toFixed(5);
		// lng = Number(position['lng']).toFixed(5);
		// console.log(position);
		
	});	

	// by default, follow user
	setInterval(function() { update(); }, 2000);

	// find pokemon within viewport
	// setInterval(function() { loadPokeRadar(); }, 10000);
	
	// tile based markers
	setInterval(function() { 
		if (initialLocationFound) {
			loadViewportMarkers(); 
		}
	}, (1000 * 20));

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
			var success = responseObject.success;
			var error = responseObject.error;

			// add notification for user
			var options =  {
    			content: "", 		// text of the snackbar
    			style: "snackbar",  // add a custom class to your snackbar
    			timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
			}
			if (success) {
				options['content'] = pokemon + " PokéNest location recorded.";
			} else {
				options['content'] = "Error: " + error;
			}
			$.snackbar(options);
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
			$('#access-password').val("");
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
				var success = responseObject.success;
				var error = responseObject.error;
	
				// add notification for user
				var options =  {
	    			content: "", 		// text of the snackbar
	    			style: "snackbar",  // add a custom class to your snackbar
	    			timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
				}
				if (success) {
					options['content'] = "[" + selectedMarkerID + "] PokéNest location removed.";
				} else {
					options['content'] = "Error: " + error;
				}
				$.snackbar(options);
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
		'Charmander', 
		'Squirtle', 
		'Caterpie', 
		'Spearow', 
		'Ekans', 
		'Pikachu', 
		'Sandshrew', 
		'Nidoran♀', 
		'Nidoran♂', 
		'Clefairy', 
		'Vulpix', 
		'Jigglypuff',
		'Zubat', 
		'Oddish', 
		'Paras', 
		'Venonat', 
		'Diglett', 
		'Meowth', 
		'Psyduck', 
		'Mankey', 
		'Growlithe',
		'Poliwag', 
		'Abra', 
		'Machop', 
		'Bellsprout',
		'Tentacool', 
		'Geodude', 
		'Ponyta', 
		'Slowpoke', 
		'Magnemite', 
		"Farfetch'd",
		'Doduo', 
		'Seel', 
		'Grimer', 
		'Shellder', 
		'Gastly', 
		'Onix', 
		'Drowzee', 
		'Krabby', 
		'Voltorb', 
		'Exeggcute', 
		'Cubone', 
		'Lickitung',
		'Koffing', 
		'Rhyhorn', 
		'Chansey', 
		'Tangela', 
		'Horsea', 
		'Goldeen', 
		'Staryu', 
		'Scyther', 
		'Jynx', 
		'Electabuzz', 
		'Magmar', 
		'Pinsir', 
		'Magikarp', 
		'Eevee'
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

function locate() {
	pokemap.locate({setView: true, maxZoom: 16});
}

function update() {

	// progress = (progress + 10) % 100;
	// $("#pokenest-progress-bar").css("width", progress + "%");

	var follow = false;
	var cookie = getCookie("follow");

	if (cookie != "") {
		if (cookie == "true") {
			follow = true;
		} 
	}

	if (!initialLocationFound) {
		pokemap.locate({setView: true, maxZoom: 10});

	} else {
		if (follow == true) {
			pokemap.locate({setView: true, maxZoom: pokemap.getZoom()});
		} else {
			pokemap.locate({setView: false, maxZoom: 16});
		}
	}
}

function onLocationFound(e) {

    var newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
    currentLocationMarker.setLatLng(newLatLng);
    console.log("user's current location: (" + newLatLng.lat + " ," + newLatLng.lng + ")");

    /* start an initial scan */
    if (!initialLocationFound) {
		initialLocationFound = true;
		loadViewportMarkers();
		// draw search radius
		var circle = L.circle([newLatLng.lat, newLatLng.lng], (SEARCH_RADIUS * 1609), {
    		color: '#00E676'
    		// fillColor: '#FFEBEE',
    		// fillOpacity: 0.5
		}).addTo(pokemap);
	}
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

/* parse autocomplete box result, get resource URL */
function iconURL(pokemonName) {

	// convert pokemon name to lowercase
	pokemonName = pokemonName.toLowerCase();

	// cover general and special cases regarding naming
	var resourceURL;
	switch(pokemonName) {
		case "Nidoran♂":
			resourceURL = "../img/pokemon-sprites/nidoranm.png";
			break;
		case "Nidoran♀":
			resourceURL = "../img/pokemon-sprites/nidoranf.png";
			break;
		case "Farfetch'd":
			resourceURL = "../img/pokemon-sprites/farfetchd.png";
			break;
		default:
			resourceURL = "../img/pokemon-sprites/" + pokemonName + ".png";
	}

	return resourceURL;
}
