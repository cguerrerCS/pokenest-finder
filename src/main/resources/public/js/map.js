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

	console.log("processing current viewport and loading markers...");

	/* get user's current viewport as a latlng bounding box */
	var bounds = pokemap.getBounds();
	var northEastLat = bounds._northEast.lat;
	var northEastLng = bounds._northEast.lng;
	var southWestLat = bounds._southWest.lat;
	var southWestLng = bounds._southWest.lng;

	/* convert longitude bounds to cacheable ranges (string form) */
	var loLng = southWestLng;
	var hiLng = northEastLng;
	var minLngBound = Math.floor(loLng/TILE_WIDTH) * (TILE_WIDTH);
	var maxLngBound = Math.floor(hiLng/TILE_WIDTH) * (TILE_WIDTH);
	console.log("Longitude low: " + loLng);
	console.log("Longitude high: " + hiLng);
	console.log("Longitude bounds: [" + minLngBound + "," + maxLngBound + "]");

	/* convert latitude bounds to cacheable ranges (string form) */
	var loLat = southWestLat;
	var hiLat = northEastLat;
	var minLatBound = Math.floor(loLat/TILE_HEIGHT) * (TILE_HEIGHT);
	var maxLatBound = Math.floor(hiLat/TILE_HEIGHT) * (TILE_HEIGHT);
	console.log("Latitude low: " + loLat);
	console.log("Latitude high: " + hiLat);
	console.log("Latitude bounds: [" + minLatBound + "," + maxLatBound + "]");

	var lat;
	var lng;

	for (lat = minLatBound; lat <= maxLatBound; lat = parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  
    	for (lng = minLngBound; lng <= maxLngBound; lng = parseFloat(math.eval(lng + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION))) {  

    		var southWestPoint = {lat: lat, lng: lng};
    		var northEastPoint = {lat: parseFloat(math.eval(lat + "+" + TILE_HEIGHT).toFixed(FLOAT_PRECISION)), lng: parseFloat(math.eval(lng + "+" + TILE_WIDTH).toFixed(FLOAT_PRECISION))};
    		// console.log("southWest point: (" + southWestPoint.lat + "," + southWestPoint.lng + ")");
    		// console.log("northEast point: (" + northEastPoint.lat + "," + northEastPoint.lng + ")");

 			// draw all southwest bounding box points
 			L.circle([southWestPoint.lat, southWestPoint.lng], 10, {
    			color: 'red',
    			fillColor: '#f03',
    			fillOpacity: 0.5
			}).addTo(pokemap);

 			// draw all northeast bounding box points
			L.circle([northEastPoint.lat, northEastPoint.lng], 10, {
    			color: 'blue',
    			fillColor: '#4d4dff',
    			fillOpacity: 0.5
			}).addTo(pokemap);

			var boundingBox = {northEast: northEastPoint, southWest: southWestPoint};
			console.log(boundingBox);
		}
	}

	/* TODO: request map tile info from the server */

	/* TODO: cache server results */

	/* TODO: display viewport markers */
}
