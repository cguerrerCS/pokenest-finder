/* Globally defined Pokenest variables */
var infomap = undefined;
var nestDetailsMarker = undefined;

$( document ).ready(function() {

	// TODO: setup mini map & mini map marker
	infomap = L.map('infomapid', {
		zoomControl: false,
		inertia: false, 
		center: [29.7604, -95.3698],
		zoom: 10
	});

	infomap.touchZoom.disable();
	infomap.doubleClickZoom.disable(); 
	infomap.scrollWheelZoom.disable();
	infomap.dragging.disable();

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

		// TODO: extract user's cookie data regarding privileged access
		var privileged = (getCookie("access") == "true");
		var password = getCookie("passwd");

		console.log(id);
		console.log(privileged);
		console.log(password);

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

		// TODO: show modal after all values are set
		$('#myMarkerModal').modal();
	});

	$('#myMarkerModal').on('show.bs.modal', function(){
		// adjust map sizing to fit modal
	    setTimeout(function() { infomap.invalidateSize(); }, 500);
	});
});

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

	console.log("resourceURL: " + resourceURL);
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