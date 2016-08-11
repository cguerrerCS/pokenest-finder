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

const TILE_WIDTH = 0.1;    // latlng units
const TILE_HEIGHT = 0.1;   // latlng units
const FLOAT_PRECISION = 2; // floating point rounded using .toFixed(FLOAT_PRECISION)

function loadViewportMarkers() {

	/* user's current viewport as a latlng bounding box */
	var bounds = pokemap.getBounds();
	var northEastLat = bounds._northEast.lat;
	var northEastLng = bounds._northEast.lng;
	var southWestLat = bounds._southWest.lat;
	var southWestLng = bounds._southWest.lng;

	/* convert longitude bounds to cacheable tiles (string form) */
	var loLng = southWestLng;
	var hiLng = northEastLng;
	var minLngBound = Math.floor(loLng/TILE_WIDTH) * (TILE_WIDTH);
	var maxLngBound = Math.floor(hiLng/TILE_WIDTH) * (TILE_WIDTH);
	// console.log("Longitude low: " + loLng);
	// console.log("Longitude high: " + hiLng);
	// console.log("Longitude bounds: [" + minLngBound + "," + maxLngBound + "]");

	/* convert latitude bounds to cacheable tiles (string form) */
	var loLat = southWestLat;
	var hiLat = northEastLat;
	var minLatBound = Math.floor(loLat/TILE_HEIGHT) * (TILE_HEIGHT);
	var maxLatBound = Math.floor(hiLat/TILE_HEIGHT) * (TILE_HEIGHT);
	// console.log("Latitude low: " + loLat);
	// console.log("Latitude high: " + hiLat);
	// console.log("Latitude bounds: [" + minLatBound + "," + maxLatBound + "]");

	var tiles = [];
	var lat;
	var lng;

	for (lat = minLatBound; lat <= maxLatBound; lat = parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  
    	for (lng = minLngBound; lng <= maxLngBound; lng = parseFloat(math.eval(lng + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  

    		var southWestPoint = {lat: lat, lng: lng};
    		var northEastPoint = {lat: parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION)), lng: parseFloat(math.eval(lng + "+" + TILE_WIDTH).toFixed(FLOAT_PRECISION))};

 			// southwest tile bounding box visualization
 			// 	L.circle([southWestPoint.lat, southWestPoint.lng], 10, {
   			//  	color: 'red',
   			//  	fillColor: '#f03',
   			//  	fillOpacity: 0.5
			// }).addTo(pokemap);

 			// northeast tile bounding box visualization
			// L.circle([northEastPoint.lat, northEastPoint.lng], 10, {
   			// 		color: 'blue',
   			//  	fillColor: '#4d4dff',
   			//  	fillOpacity: 0.5
			// }).addTo(pokemap);

			// tiles defined at latlng bounding boxes (two latlng points)
			var tile = {northEast: northEastPoint, southWest: southWestPoint};
			tiles.push(tile);
		}
	}

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
        		$.post("/nearby", privatePostParameters, function(responseJSON) {
					
        			/* get responce object */
					responseObject = JSON.parse(responseJSON);

					/* debugging logs */
					console.log(responseObject);	
					console.log(privatePostParameters);
					console.log(i);

					var rectBounds = [
						[privatePostParameters.southWestLat, privatePostParameters.southWestLng], 
						[privatePostParameters.northEastLat, privatePostParameters.northEastLng]
					];

					/* self deleting loading rectangle */
					var rectangle = L.rectangle(rectBounds, {color: "#99ff66", weight: 0}).addTo(pokemap);
					setTimeout(function(){ 
						pokemap.removeLayer(rectangle);
					}, 10000);

					// northeast tile bounding box visualization
					// var m1 = L.circle([privatePostParameters.northEastLat, privatePostParameters.northEastLng], 10, {
		   			// 		color: 'red',
   					// 	  	fillColor: '#f03',
		   			// 	    fillOpacity: 0.5
					// }).addTo(pokemap);

					// southwest tile bounding box visualization
		 			// 	var m2 = L.circle([privatePostParameters.southWestLat, privatePostParameters.southWestLng], 10, {
		   			// 	   color: 'blue',
					//     fillColor: '#4d4dff',
					// 	   fillOpacity: 0.5
					// }).addTo(pokemap);

					/* parse results of response object */
					for (i = 0; i < responseObject.length; i++) { 
    		
    					data = responseObject[i];
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
    				
						var options = {
							icon: icon,
							id: id,
							pokemon: name,
							lat: lat,
							lng: lng
						}

						L.marker([lat, lng], options).addTo(pokemap);
					}
				});
			}

    	})(i);

    	loadTileMarkers();
	}



	// console.log(tiles);

	/* TODO: request map tile info from the server */

	/* TODO: cache server results */

	/* TODO: display viewport markers */
}
