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

const TILE_WIDTH = 0.01;  // latlng units
const TILE_HEIGHT = 0.01; // latlng units

function loadViewportMarkers() {

	console.log("processing current viewport and loading markers...");

	/* get user's current viewport as a latlng bounding box */
	var bounds = pokemap.getBounds();
	var northEastLat = bounds._northEast.lat;
	var northEastLng = bounds._northEast.lng;
	var southWestLat = bounds._southWest.lat;
	var southWestLng = bounds._southWest.lng;

	/* TODO: split current viewport into map tiles */
	var loLng = southWestLng;
	var hiLng = northEastLng;
	console.log("loLng: " + loLng);
	console.log("hiLng: " + hiLng);
	console.log("loLng/0.01 = real -> " + loLng/0.01);
	console.log("hiLng/0.01 = real -> " + hiLng/0.01);
	console.log("loLng/0.01 = floor -> " + Math.floor(loLng/0.01));
	console.log("hiLng/0.01 = floor -> " + Math.floor(hiLng/0.01));

	var minLngBound = Math.floor(loLng/TILE_WIDTH) * (TILE_WIDTH);
	var maxLngBound = Math.floor(hiLng/TILE_WIDTH) * (TILE_WIDTH);
	console.log("minLngBound: " + minLngBound);
	console.log("maxLngBound: " + maxLngBound);

	var lng;
	for (lng = minLngBound; lng < maxLngBound; lng += TILE_WIDTH) { 
    	console.log("tile range (" + lng + ") to (" + (lng + TILE_WIDTH) + ")");
	}

	/* TODO: request map tile info from the server */

	/* TODO: cache server results */

	/* TODO: display viewport markers */
}
