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

const TILE_WIDTH = 0.25;     // latlng units
const TILE_HEIGHT = 0.25;    // latlng units
const FLOAT_PRECISION = 2;   // floating point rounded using .toFixed(FLOAT_PRECISION)
const PADDING = 0;           // number of padding tiles added to bounding box
const MARKERTIMEOUT = 15;    // number of seconds marker can exist without ACK from server

var SEARCH_RADIUS = 50.0;    // default 50 mile search radius
var MARKERIDS = {};          // id -> marker reference
var MARKERDATA = {};         // id -> marker data
var MARKERTIMERS = {};       // id -> marker expiration timer

/* load map tiles in user's current viewport */ 
function loadViewportMarkers() {

	// reset progress bar values, prep for a new load
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

	/* convert latitude bounds to cacheable tiles (string form) */
	var loLat = southWestLat;
	var hiLat = northEastLat;
	var minLatBound = parseFloat(math.eval((Math.floor(loLat/TILE_HEIGHT) * (TILE_HEIGHT)) + "-" + (PADDING * TILE_HEIGHT)).toFixed(FLOAT_PRECISION));
	var maxLatBound = parseFloat(math.eval((Math.floor(hiLat/TILE_HEIGHT) * (TILE_HEIGHT)) + "+" + (PADDING * TILE_HEIGHT)).toFixed(FLOAT_PRECISION));

	var tiles = [];
	var lat;
	var lng;

	// filter view port tiles, only post for tiles that have one corner in search radius circle
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

        	return function () {

        		// tiles identified using a corner latlng coordinate (unique to tile)
				var tileID = privatePostParameters.southWestLat + ":" + privatePostParameters.southWestLng;
        		$.post("/nearby", privatePostParameters, function(responseJSON) {
					
        			/* get responce object */
					responseObject = JSON.parse(responseJSON);

					var success = responseObject.success;
					var error = responseObject.error;
					var nests = responseObject.nests;

					// add failure notification for user when tile does not load correctly
					if (!success) {

						var options =  {
	    					content: "", 		// text of the snackbar
	    					style: "snackbar",  // add a custom class to your snackbar
	    					timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
						}

						options['content'] = "Error: " + error;
						$.snackbar(options);
					}

					/* progress bar increases for each loaded square */
					realProgress = (realProgress + increment) % 101;
					progress = math.floor(realProgress);
					$("#pokenest-progress-bar").css("width", progress + "%");

					/* filter any results outside of our search radius, also filter out results according to set filters */
					var filteredDataPoints = [];
					for (i = 0; i < nests.length; i++) {

						var currentLat = currentLocationMarker.getLatLng().lat;
						var currentLng = currentLocationMarker.getLatLng().lng;
						var dataPointDist = parseFloat(distance(currentLat, currentLng, nests[i].lat, nests[i].lng, 'M').toFixed(2));
						var pokenestMarkerFilter = getCookie("marker-filter");
						var nestConfirmed = (parseInt(nests[i].confirmed) == 1);

	    				if (dataPointDist <= SEARCH_RADIUS) {
	    					
							// additional filtering based on nest marker filter values
	    					if (pokenestMarkerFilter == "verified") {
	    						if (nestConfirmed) {
	    							filteredDataPoints.push(nests[i]);
	    						}
	    					} else if (pokenestMarkerFilter == "nonverified") {
	    						if (!nestConfirmed) {
	    							filteredDataPoints.push(nests[i]);
	    						}
	    					} else {
	    						// get here if cookie is not set or set to value "all", no filter
	    						filteredDataPoints.push(nests[i]);
	    					}

	    				}
					}

					/* parse results of response object */
					for (i = 0; i < filteredDataPoints.length; i++) { 
    		
    					var data = filteredDataPoints[i];
    					var id = data.nestid;
    					var name = data.pokemon;
	    				var confirmed = (parseInt(data.confirmed) == 1);
	    				var lat = parseFloat(data.lat);
	    				var lng = parseFloat(data.lng);

	    				var icon = L.icon({	
	    					iconUrl: iconURL(data.pokemon),
	    					iconSize:     [96, 96], // size of the icon
	    					iconAnchor:   [48, 48], // point of the icon which will correspond to marker's location
	    					popupAnchor:  [-3, -20] // point from which the popup should open relative to the iconAnchor
						});

						var options = {
							icon: icon,
							zIndexOffset: 500,
							pokemon: name,
							nestid: id
						}

    					/* if marker is not already drawn */
    					if (!(id in MARKERIDS)) {
	    					
	    					// Define action for when a nest marker is selected
							var m = L.marker([lat, lng], options).addTo(pokemap).on('click', function() {
	    
	    						// nestid is stored as an option for nest marker
				    			var nestid = this.options.nestid;
				    			
				    			// Log the selected marker and corresponding nestid
				    			selectedInfoMarker = this;

				    			// Fill in nest data for modal
				    			// $('#markerdata-header').html(MARKERDATA[nestid].pokemon + " Pokenest Details");
				    			$('#markerdata-header').html("Pokenest: " + nestid);

				    			var lat1 = currentLocationMarker.getLatLng().lat;
				    			var lon1 = currentLocationMarker.getLatLng().lng;
				    			var lat2 = parseFloat(this.getLatLng().lat);
				    			var lon2 = parseFloat(this.getLatLng().lng);
				    			var dist = parseFloat(distance(lat1, lon1, lat2, lon2, 'M').toFixed(2));
				    			$('#markerdata-distance').html("Distance   <b>" + dist + "</b> mi.");

				    			var googleMapsDirectionsURL = "https://www.google.com/maps/dir/" + lat1 + "," + lon1 +"/" + lat2 + "," + lon2;
				    			$('#markerdata-googlemap-directions-link').attr('href', googleMapsDirectionsURL);

				    			$('#markerdata-species').html("Species  " + MARKERDATA[nestid].pokemon + "</b>");
				    			$('#markerdata-confirmed').html("Confirmed  <b>" + (MARKERDATA[nestid].confirmed == 1) + "</b>");

				    			// load vote information for this marker on click
				    			loadVoteInfo(MARKERDATA[nestid].nestid, MARKERDATA[nestid].upvotes, MARKERDATA[nestid].downvotes);
				    			
				    			// show or hide privileged action buttons
				    			var privileged = (getCookie("access") == "true");
				    			if (privileged) {

									$('#removeEntryBtn').show();
				    				if (MARKERDATA[nestid].confirmed == 1) {
				    					$('#confirmEntryBtn').hide();
				    					$('#refuteEntryBtn').show();
				    				} else {
				    					$('#confirmEntryBtn').show();
				    					$('#refuteEntryBtn').hide();
				    				}
				    				
				    			} else {
				    				$('#removeEntryBtn').hide();
				    				$('#confirmEntryBtn').hide();
				    				$('#refuteEntryBtn').hide();
				    			}
				    			
				    			// show marker details modal
				    			$('#myMarkerModal').modal();
	    					});	

							// Add nest marker to the map
							// console.log(data.pokemon.toLowerCase() + " Pokenest added. [id: " + data.nestid + "]");
							MARKERIDS[id] = m;
							MARKERDATA[id] = data; 
							MARKERTIMERS[id] = setTimeout(function(pokename, nestid) { return function() { 

								if (pokemap.hasLayer(MARKERIDS[nestid])) {
									pokemap.removeLayer(MARKERIDS[nestid]);
									delete MARKERIDS[nestid];
									delete MARKERDATA[nestid];
									delete MARKERTIMERS[nestid];
									// console.log(pokename + " Pokenest marker expired. [" + nestid + "]");
								} else {
									console.log(pokename + " Pokenest marker undefined. [" + nestid + "]");
								}
								
							}; }(name, id), 1000 * MARKERTIMEOUT);
    					
						} else {

							// update marker information
							MARKERDATA[id] = data;

							// TODO: if selected marker nestid data changes, update the corresponding details modal
							if (selectedInfoMarker !== undefined) {
								if (MARKERDATA[selectedInfoMarker.options.nestid] !== undefined) {
									if (selectedInfoMarker.options.nestid == data.nestid) {
										updateSelectedMarkerModalData();
									}
								}
							}
							
							// reset marker timeout after server ACK
							var resetExpirationTimer = (function (pokename, nestid) {
								return function() {

									clearTimeout(MARKERTIMERS[nestid]);
									MARKERTIMERS[id] = setTimeout(function(pokename, nestid) { return function() { 
										if (pokemap.hasLayer(MARKERIDS[nestid])) {
											pokemap.removeLayer(MARKERIDS[nestid]);
											delete MARKERIDS[nestid];
											delete MARKERDATA[nestid];
											delete MARKERTIMERS[nestid];
											// console.log(pokename + " Pokenest marker expired. [" + nestid + "]");
										} else {
											console.log(pokename + " Pokenest marker undefined. [" + nestid + "]");
										}
									}; }(name, id), 1000 * MARKERTIMEOUT);

								}

							})(name, id);

							// console.log(name + " Pokenest updated. [id: " + data.nestid + "]");
							resetExpirationTimer();
						}
					}
				});
			}
    	})(i);

    	loadTileMarkers();
	}
}

/* Update any updateable data related to nest marker (confirmed, upvotes, downvotes, privileges) */
function updateSelectedMarkerModalData() {

	// if some marker has been selected
	if (selectedInfoMarker !== undefined) {

		// TODO: check that selected marker has not been removed
		if (MARKERDATA[selectedInfoMarker.options.nestid] !== undefined) {

			// get selected nest id
			var nestid = selectedInfoMarker.options.nestid;

			// update species field (when changes implemented)

			// update confirmed field
			$('#markerdata-confirmed').html("Confirmed  <b>" + (MARKERDATA[nestid].confirmed == 1) + "</b>");

			// update votes fields
			refreshVoteInfo(MARKERDATA[nestid].nestid, MARKERDATA[nestid].upvotes, MARKERDATA[nestid].downvotes);

			// show or hide privileged action buttons
			var privileged = (getCookie("access") == "true");
			if (privileged) {

				$('#removeEntryBtn').show();
				if (MARKERDATA[nestid].confirmed == 1) {

					$('#confirmEntryBtn').hide();
					$('#refuteEntryBtn').show();
				} else {
					
					$('#confirmEntryBtn').show();
					$('#refuteEntryBtn').hide();
				}
				
			} else {
				$('#removeEntryBtn').hide();
				$('#confirmEntryBtn').hide();
				$('#refuteEntryBtn').hide();
			}
		}
	}
}