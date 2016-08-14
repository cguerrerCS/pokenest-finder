//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2015            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

const TILE_WIDTH = 0.1;     // latlng units
const TILE_HEIGHT = 0.1;    // latlng units
const FLOAT_PRECISION = 2;  // floating point rounded using .toFixed(FLOAT_PRECISION)
const PADDING = 0;          // number of padding tiles added to bounding box

var CACHE = {};             // tile cache
var SEARCH_RADIUS = 50.0    // default 20 mile search radius
var MARKERIDS = {};
var MARKERTIMERS = {};

function loadViewportMarkers() {

	console.log(MARKERIDS);

	// reset progress bar values
	progress = 0;
	realProgress = 0.0;
	$("#pokenest-progress-bar").css("width","0%");

	/* user's current viewport as a latlng bounding box */
	var bounds = pokemap.getBounds();
	var northEastLat = bounds._northEast.lat;
	var northEastLng = bounds._northEast.lng;
	var southWestLat = bounds._southWest.lat;
	var southWestLng = bounds._southWest.lng;

	/* convert longitude bounds to cacheable tiles (string form) */
	var loLng = southWestLng;
	var hiLng = northEastLng;
	var minLngBound = parseFloat(math.eval((Math.floor(loLng/TILE_WIDTH) * (TILE_WIDTH)) + "-" + (PADDING * TILE_WIDTH)).toFixed(FLOAT_PRECISION));
	var maxLngBound = parseFloat(math.eval((Math.floor(hiLng/TILE_WIDTH) * (TILE_WIDTH)) + "+" + (PADDING * TILE_WIDTH)).toFixed(FLOAT_PRECISION));
	console.log("Longitude bounds: [" + minLngBound + "," + maxLngBound + "]");

	/* convert latitude bounds to cacheable tiles (string form) */
	var loLat = southWestLat;
	var hiLat = northEastLat;
	var minLatBound = parseFloat(math.eval((Math.floor(loLat/TILE_HEIGHT) * (TILE_HEIGHT)) + "-" + (PADDING * TILE_HEIGHT)).toFixed(FLOAT_PRECISION));
	var maxLatBound = parseFloat(math.eval((Math.floor(hiLat/TILE_HEIGHT) * (TILE_HEIGHT)) + "+" + (PADDING * TILE_HEIGHT)).toFixed(FLOAT_PRECISION));
	console.log("Latitude bounds: [" + minLatBound + "," + maxLatBound + "]");

	var tiles = [];
	var lat;
	var lng;

	for (lat = minLatBound; lat <= maxLatBound; lat = parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  
    	for (lng = minLngBound; lng <= maxLngBound; lng = parseFloat(math.eval(lng + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  

    		// define bounds for a latlng bounding box
    		var southWestPoint = {lat: lat, lng: lng};
    		var northEastPoint = {lat: parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION)), lng: parseFloat(math.eval(lng + "+" + TILE_WIDTH).toFixed(FLOAT_PRECISION))};
			
			// tile is defined as a latlng bounding box (two latlng points)
    		var tile = {northEast: northEastPoint, southWest: southWestPoint};

    		// get user's last recorded current location
			var currentLat = currentLocationMarker.getLatLng().lat;
			var currentLng = currentLocationMarker.getLatLng().lng;

    		/* 
			 * d1 : distance from user's location to the top left corner of cache tile 
		     * d2 : distance from user's location to the top right corner of cache tile
		     * d3 : distance from user's location to the bottom right corner of cache tile
		     * d4 : distance from user's location to the bottom left corner of cache tile
			 */
			var d1 = parseFloat(distance(currentLat, currentLng, tile.northEast.lat, tile.southWest.lng, 'M').toFixed(2));
			var d2 = parseFloat(distance(currentLat, currentLng, tile.northEast.lat, tile.northEast.lng, 'M').toFixed(2));
			var d3 = parseFloat(distance(currentLat, currentLng, tile.southWest.lat, tile.northEast.lng, 'M').toFixed(2));
			var d4 = parseFloat(distance(currentLat, currentLng, tile.southWest.lat, tile.southWest.lng, 'M').toFixed(2));

    		// only sending post requests about tiles within our search radius
    		if ((d1 <= SEARCH_RADIUS) || (d2 <= SEARCH_RADIUS) || (d3 <= SEARCH_RADIUS) || (d4 <= SEARCH_RADIUS)) {
				tiles.push(tile);
			}
		}
	}

	// prepare progress bar for scan
	var increment = math.eval(100 + "/" + tiles.length);
	var leftover = math.floor(100 - (increment * tiles.length));
	$("#pokenest-progress-bar").css("width", leftover + "%");	

	// console.log("loading " + tiles.length + " tiles...");
	// console.log("increment by " + increment + "%");
	// console.log("real leftover is " + (100 - (increment * tiles.length)) + "%");
	// console.log("leftover is " + leftover + "%");

	var i;
	for (i = 0; i < tiles.length; i++) {
		
		/* post parameters redefined by each asynchronous function */
		var sharedPostParameters = {
			southWestLat: tiles[i].southWest.lat, 
			southWestLng: tiles[i].southWest.lng,
			northEastLat: tiles[i].northEast.lat, 
			northEastLng: tiles[i].northEast.lng
		}	

		/* loadtile function sets its "private" variables using a closure (copy of i value and clone of postParameters)*/
		var loadTileMarkers = (function(i) {

			var privatePostParameters = {
				southWestLat: sharedPostParameters.southWestLat, 
				southWestLng: sharedPostParameters.southWestLng,
				northEastLat: sharedPostParameters.northEastLat, 
				northEastLng: sharedPostParameters.northEastLng
			}	

			// calculate tile width in miles
			// var tileWidth = parseFloat(distance(privatePostParameters.southWestLat, privatePostParameters.southWestLng,
			// 	privatePostParameters.northEastLat, privatePostParameters.southWestLng, 'M').toFixed(2));
			// console.log("latlng tile width: " + tileWidth + " mi");
        	return function () {

        		// tiles identified using a corner latlng coordinate (unique to tile)
				var tileID = privatePostParameters.southWestLat + ":" + privatePostParameters.southWestLng;
				// console.log("ID: " + tileID);

				// if tileID does not exist in CACHE as a key
				// if (!(tileID in CACHE)) {
				if (true) {

	        		$.post("/nearby", privatePostParameters, function(responseJSON) {
						
	        			/* get responce object */
						responseObject = JSON.parse(responseJSON);

						/* progress bar increases for each loaded square */
						realProgress = (realProgress + increment) % 101;
						progress = math.floor(realProgress);
						$("#pokenest-progress-bar").css("width", progress + "%");

						/* self deleting loading rectangle */
						var rectBounds = [
							[privatePostParameters.southWestLat, privatePostParameters.southWestLng], 
							[privatePostParameters.northEastLat, privatePostParameters.northEastLng]
						];
						var rectangle = L.rectangle(rectBounds, {color: '#99ff66', weight: 0}).addTo(pokemap);
						setTimeout(function(){ 
							pokemap.removeLayer(rectangle);
						}, 1000 * 5);

						/* parse results of response object */
						for (i = 0; i < responseObject.length; i++) { 
	    		
	    					data = responseObject[i];
	    					var id = data.id;

	    					/* only create markers for data points within search radius */


	    					/* if marker is not already drawn */
	    					if (!(id in MARKERIDS)) {

		    					var name = data.pokemon.toLowerCase();
		    					var lat = parseFloat(data.lat);
		    					var lng = parseFloat(data.lng);
			    				var icon = L.icon({	
			    					iconUrl: 'http://www.pokestadium.com/sprites/diamond-pearl/' + name + '.png',
			    					iconSize:     [96, 96], // size of the icon
			    					iconAnchor:   [48, 48], // point of the icon which will correspond to marker's location
			    					popupAnchor:  [-3, -20] // point from which the popup should open relative to the iconAnchor
								});
		    				
								var options = {
									icon: icon,
									id: id,
									pokemon: name,
									lat: lat,
									lng: lng
								}

								var m = L.marker([lat, lng], options).addTo(pokemap).on('click', function() {
		    
					    			var pokemon = this.options.pokemon;
					    			pokemon = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
					    			var id = this.options.id;
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

					    			var lat1 = currentLocationMarker.getLatLng().lat;
					    			var lon1 = currentLocationMarker.getLatLng().lng;
					    			var lat2 = parseFloat(this.options.lat);
					    			var lon2 = parseFloat(this.options.lng);
					    			var dist = parseFloat(distance(lat1, lon1, lat2, lon2, 'M').toFixed(2));
					    			$('#markerdata-distance').html("Distance   <b>" + dist + "</b> mi.");
		    					});	

								// add marker to map
								MARKERIDS[id] = m;
	    					
								// set marker's expiration timer and clear old timeOur
								MARKERTIMERS[id] = setTimeout(function(){
									pokemap.removeLayer(MARKERIDS[id]);
									delete MARKERIDS[id];
									delete MARKERTIMERS[id];
								}, 1000 * 60);

							} else {

								// TODO: update marker information
								// ...
							
								// reset marker's expiration timer
								clearTimeout(MARKERTIMERS[id]);
								MARKERTIMERS[id] = setTimeout(function(){
									pokemap.removeLayer(MARKERIDS[id]);
									delete MARKERIDS[id];
									delete MARKERTIMERS[id];
								}, 1000 * 60);
							}
						}

						/* place key in cache */
						// CACHE[tileID] = undefined;
					});

					
				}
			}
    	})(i);

    	loadTileMarkers();
	}

	// console.log(tiles);

	/* TODO: request map tile info from the server */

	/* TODO: cache server results */

	/* TODO: display viewport markers */
}
