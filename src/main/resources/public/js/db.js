/* Globally defined Pokenest variables */
var infomap = undefined;
var nestDetailsMarker = undefined;
var selectedNestId = undefined;

$( document ).ready(function() {

	// material design startup
	$.material.init();
	$.material.ripples(".db-list-item");

	// TODO: setup mini map & mini map marker
	infomap = L.map('infomapid', {
		zoomControl: false,
		inertia: false, 
		center: [29.7604, -95.3698],
		zoom: 10
	});

	// infomap.touchZoom.disable();
	// infomap.doubleClickZoom.disable(); 
	// infomap.scrollWheelZoom.disable();
	// infomap.dragging.disable();

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'cguerrer.0ndip406',
    	accessToken: 'pk.eyJ1IjoiY2d1ZXJyZXIiLCJhIjoiY2lxdmlzYmgxMDAxM2Z2bThvcm9kNGx1YiJ9.GdNs-_3lu5C2HrTqEbYGWg'
	}).addTo(infomap);

	nestDetailsMarker = L.marker([0, 0], 10, {
    	zIndexOffset: 1000
	}).addTo(infomap);

	// TODO: add check listeners to list items
	$('.db-list-item').click(function() {

		// TODO: extract nest id from selected DOM element
		var id = (this.children[0].innerText.split(':')[1]).trim();
		var pokemon = (this.children[1].innerText.split(':')[1]).trim();
		var lat = parseFloat((this.children[2].innerText.split(':')[1]).trim());
		var lng = parseFloat((this.children[3].innerText.split(':')[1]).trim());
		var coordinates = new L.LatLng(lat, lng);
		selectedNestId = id;

		// TODO: extract user's cookie data regarding privileged access
		var privileged = (getCookie("access") == "true");
		var password = getCookie("passwd");

		// TODO: fill in nest details nest modal
		$('#markerdata-header').html(pokemon + " Pokenest Details");

		// TODO: create an with the selected nest icon and place in the center markers
		var pokenestIcon = L.icon({	
		    iconUrl: iconURL(pokemon),
		    iconSize:    [64, 64], // size of the icon
		    iconAnchor:  [32, 32], // point of the icon which will correspond to marker's location
		});
		nestDetailsMarker.setIcon(pokenestIcon);

		// TODO: adjust view to center on selected pokenest coordinates
	    infomap.setView(coordinates, 16);

	    // TODO: adjust position of nest marker
	    nestDetailsMarker.setLatLng(coordinates);

		// TODO: give option to delete if password is stored in a cookie
		if (privileged) {
			$("#removeEntryBtn").show();
			$("#confirmEntryBtn").show();
		} else {
			$("#removeEntryBtn").hide();
			$("#confirmEntryBtn").hide();
		}

		// TODO: show modal after all values are set
		$('#myMarkerModal').modal();
	});

	$('#myMarkerModal').on('show.bs.modal', function(){
		// adjust map sizing to fit modal
	    setTimeout(function() { infomap.invalidateSize(); }, 500);
	});

	$('#removeEntryBtn').on('click', function() {

		var privileged = (getCookie("access") == "true");
		var password = getCookie("passwd");

		if (privileged) {

			var postParameters = {id: selectedNestId, password: password};
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
					options['content'] = "[" + selectedNestId + "] PokéNest location removed.";
				} else {
					options['content'] = "Error: " + error;
				}
				$.snackbar(options);
			}); 
		}

		$('#myMarkerModal').modal('hide');
	});

	$('#confirmEntryBtn').on('click', function() {

		var privileged = (getCookie("access") == "true");
		var password = getCookie("passwd");

		if (privileged) {

			var postParameters = {id: selectedNestId, password: password};
			$.post("/confirm", postParameters, function(responseJSON){

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
					options['content'] = "[" + selectedNestId + "] PokéNest location confirmed.";
				} else {
					options['content'] = "Error: " + error;
				}
				$.snackbar(options);
			}); 
		}

		$('#myMarkerModal').modal('hide');
	});
});

function iconURL(pokemonName) {

	// convert pokemon name to lowercase
	pokemonName = pokemonName.toLowerCase();

	// cover general and special cases regarding naming
	var resourceURL;
	switch(pokemonName) {
		case "nidoran♂":
			resourceURL = "../img/pokemon-sprites/nidoranm.png";
			break;
		case "nidoran♀":
			resourceURL = "../img/pokemon-sprites/nidoranf.png";
			break;
		case "farfetch'd":
			resourceURL = "../img/pokemon-sprites/farfetchd.png";
			break;
		default:
			resourceURL = "../img/pokemon-sprites/" + pokemonName + ".png";
	}

	return resourceURL;
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