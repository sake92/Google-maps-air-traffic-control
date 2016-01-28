google.maps.event.addDomListener(window, 'load', load);

// za filtriranje markera po trenutnom prozoru mape
var latMin;
var latMax;
var lonMin;
var lonMax;

var airplaneMarkers = [];
var airplaneRoute;
var maxFlights = 25;
var map;
var mapKabina;

function load() {
	var center = new google.maps.LatLng(44.0, 18.0); // Bosna i Hercegovina
	
	var styles = [
  {
    "featureType": "road",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.province",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.locality",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "elementType": "labels.text",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.land_parcel",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#0a8080" }
    ]
  }
]

	var styledMap = new google.maps.StyledMapType(styles,
		{name: "Styled Map"});
	
	
	
	map = new google.maps.Map(document.getElementById("map"), {
			center : center,
			zoom : 7,
			mapTypeId : 'roadmap',
			minZoom : 5,
			maxZoom : 11,
			disableDefaultUI : true,
			zoomControl : true,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
			}
		});
	
	map.mapTypes.set('map_style', styledMap);
	map.setMapTypeId('map_style');

	// ili 'bounds_changed' event, sporije puno
	google.maps.event.addListener(map, 'idle', function () {
		refresh();
	});
	
	document.getElementById("refresh").onclick = refresh;
}

function refresh() {
	var bounds = map.getBounds();
	var sw = bounds.getSouthWest();
	var ne = bounds.getNorthEast();
	latMin = sw.lat();
	lonMin = sw.lng();
	latMax = ne.lat();
	lonMax = ne.lng();
	maxFlights = document.getElementById("maxFlights").value;
	fillAirplanes(map);
}

// funkcija za popunjavanje markera aviona
function fillAirplanes(map) {

	// očisti sve markere aviona
	for (var i = 0; i < airplaneMarkers.length; i++) {
		airplaneMarkers[i].setMap(null);
	}
	airplaneMarkers = [];

	// dobavi nove markere aviona
	var airplanesUrl = "php/flights.php?latMin=" + latMin + "&latMax=" + latMax
		 + "&lonMin=" + lonMin + "&lonMax=" + lonMax + "&maxFlights=" + maxFlights;
	downloadUrl(airplanesUrl, function (data) {
		var xml = data.responseXML;
		var markers = xml.documentElement.getElementsByTagName("airplane");

		for (var i = 0; i < markers.length; i++) {

			var point = new google.maps.LatLng(
					parseFloat(markers[i].getAttribute("lat")),
					parseFloat(markers[i].getAttribute("lon")));
			var angle = parseFloat(markers[i].getAttribute("angle"));

			var planeSVG = {
				path : "M 256.123,219.001 C 256.123,219.001 256.506,220.656 256.463,222.397"
				+ " C 256.422,224.103 255.953,227.831 255.953,226.982 C 255.953,226.133 "
				+ "254.426,225.072 254.426,225.072 L 254.213,226.557 L 253.025,226.6 "
				+ "L 252.983,224.222 L 216.942,207.879 C 216.942,207.879 216.9,205.841 "
				+ "216.73,205.799 C 216.688,207.836 216.815,209.195 216.56,209.364 C "
				+ "216.221,209.237 176.673,191.676 175.808,191.195 C 175.426,190.983 "
				+ "175.638,189.243 175.638,189.243 L 165.45,187.715 L 165.408,189.073 "
				+ "C 165.408,189.073 143.97,186.059 143.376,186.441 C 142.782,186.823 "
				+ "143.929,209.874 142.909,225.496 C 141.89,241.117 140.15,249.522 "
				+ "139.386,252.536 C 138.673,255.349 139.259,255.974 140.617,257.163 "
				+ "C 141.975,258.352 169.27,278.559 171.563,280.299 C 173.814,282.008 "
				+ "173.856,282.789 173.856,283.822 C 173.856,285.18 173.898,294.137 "
				+ "173.898,294.137 L 135.905,284.883 C 135.905,284.883 135.692,288.66 "
				+ "135.141,289.212 C 134.588,289.765 133.443,289.552 133.443,289.552 C 133.443,289.552 132.678,297.406 132.255,297.915 C 131.83,298.424 131.109,298.679 131.109,298.679 C 131.109,298.679 129.415,306.778 128.636,306.99 C 128.636,306.993 128.636,306.998 128.636,307 C 128.63,307 128.624,306.996 128.62,306.995 C 128.614,306.996 128.608,307 128.604,307 C 128.604,306.998 128.604,306.993 128.604,306.99 C 127.825,306.778 126.13,298.679 126.13,298.679 C 126.13,298.679 125.408,298.424 124.984,297.915 C 124.56,297.405 123.796,289.552 123.796,289.552 C 123.796,289.552 122.65,289.765 122.098,289.212 C 121.546,288.66 121.334,284.883 121.334,284.883 L 83.341,294.137 C 83.341,294.137 83.383,285.18 83.383,283.822 C 83.383,282.789 83.425,282.008 85.675,280.299 C 87.967,278.559 115.263,258.352 116.621,257.163 C 117.979,255.974 118.565,255.349 117.852,252.536 C 117.088,249.522 115.348,241.117 114.329,225.496 C 113.31,209.874 114.456,186.823 113.862,186.441 C 113.268,186.059 91.83,189.073 91.83,189.073 L 91.788,187.715 L 81.6,189.243 C 81.6,189.243 81.812,190.983 81.43,191.195 C 80.565,191.676 41.017,209.237 40.678,209.364 C 40.423,209.194 40.551,207.836 40.508,205.799 C 40.338,205.841 40.296,207.879 40.296,207.879 L 4.254,224.222 L 4.212,226.6 L 3.024,226.557 L 2.812,225.072 C 2.812,225.072 1.284,226.134 1.284,226.982 C 1.284,227.83 0.816,224.103 0.775,222.397 C 0.733,220.657 1.115,219.001 1.115,219.001 C 1.115,219.001 -0.116,219.383 0.011,217.77 C 0.093,216.741 3.28,212.04 3.28,212.04 C 3.28,212.04 3.506,211.335 3.467,210.837 C 3.422,210.258 4.128,209.885 4.501,209.554 C 4.717,209.363 4.478,208.313 4.478,208.313 C 4.478,208.313 16.421,198.072 37.114,182.028 C 57.773,166.01 82.224,146.37 82.224,146.37 C 82.224,146.37 82.224,145.238 81.998,143.653 C 81.771,142.069 81.602,141.389 81.602,141.389 C 81.602,141.389 80.357,140.993 80.017,139.974 C 79.764,139.214 79.112,133.691 79.225,128.71 C 79.338,123.729 79.621,121.126 79.961,120.333 C 80.3,119.541 81.448,119.19 82.904,118.975 C 84.432,118.749 90.362,118.889 91.79,119.088 C 93.146,119.277 93.998,119.484 94.224,121.409 C 94.45,123.333 94.507,129.955 94.337,132.672 C 94.216,134.606 93.714,136.804 93.997,136.917 C 94.28,137.03 99.204,132.219 101.921,130.295 C 104.638,128.37 109.279,124.352 109.845,123.107 C 110.411,121.862 110.468,121.692 110.807,122.824 C 111.146,123.956 111.09,125.088 110.637,125.88 C 110.184,126.672 109.958,127.692 110.41,128.144 C 110.58,128.314 111.938,127.182 112.278,126.502 C 112.618,125.823 112.278,124.521 112.505,123.955 C 112.732,123.389 113.618,121.747 113.58,120.389 C 113.354,112.295 113.079,100.183 113.014,73.694 C 112.945,45.348 113.226,36.88 116.806,21.735 C 120.056,7.987 122.498,5.268 123.748,3.285 C 124.904,1.452 127.513,0.028 128.605,0.003 C 128.605,0.003 128.605,0.001 128.605,0.001 C 128.609,0.001 128.615,0.002 128.621,0.002 C 128.625,0.002 128.631,0.001 128.637,0.001 C 128.637,0.001 128.637,0.003 128.637,0.003 C 129.728,0.028 132.336,1.453 133.492,3.285 C 134.742,5.267 137.183,7.987 140.434,21.735 C 144.014,36.88 144.295,45.348 144.226,73.694 C 144.162,100.183 143.886,112.296 143.66,120.389 C 143.623,121.747 144.51,123.389 144.736,123.955 C 144.962,124.521 144.623,125.823 144.963,126.502 C 145.302,127.181 146.66,128.314 146.83,128.144 C 147.283,127.691 147.057,126.672 146.603,125.88 C 146.149,125.088 146.093,123.956 146.433,122.824 C 146.773,121.692 146.829,121.862 147.396,123.107 C 147.961,124.352 152.603,128.371 155.32,130.295 C 158.037,132.219 162.961,137.03 163.244,136.917 C 163.527,136.804 163.025,134.606 162.904,132.672 C 162.734,129.955 162.791,123.333 163.017,121.409 C 163.243,119.485 164.095,119.278 165.451,119.088 C 166.88,118.888 172.809,118.749 174.338,118.975 C 175.793,119.191 176.942,119.541 177.281,120.333 C 177.621,121.125 177.904,123.729 178.017,128.71 C 178.129,133.691 177.477,139.214 177.224,139.974 C 176.884,140.993 175.639,141.389 175.639,141.389 C 175.639,141.389 175.469,142.068 175.243,143.653 C 175.016,145.238 175.016,146.37 175.016,146.37 C 175.016,146.37 199.467,166.011 220.125,182.028 C 240.818,198.072 252.762,208.313 252.762,208.313 C 252.762,208.313 252.522,209.363 252.739,209.554 C 253.112,209.885 253.818,210.258 253.772,210.837 C 253.733,211.335 253.959,212.04 253.959,212.04 C 253.959,212.04 257.147,216.741 257.229,217.77 C 257.354,219.383 256.123,219.001 256.123,219.001 z M 8.536,207.093 L 6.143,208.927 L 6.35,209.197 L 8.764,207.347 L 8.536,207.093 z M 13.335,203.415 L 8.806,206.886 L 9.033,207.14 L 13.543,203.683 L 13.335,203.415 z M 18.144,199.729 L 13.605,203.208 L 13.813,203.477 L 18.324,200.02 L 18.144,199.729 z M 24.203,195.086 L 18.415,199.522 L 18.595,199.813 L 24.403,195.361 L 24.203,195.086 z M 29.79,190.805 L 24.472,194.879 L 24.672,195.154 L 29.995,191.074 L 29.79,190.805 z M 35.438,186.477 L 30.06,190.598 L 30.266,190.869 L 35.634,186.755 L 35.438,186.477 z M 41.278,182 L 35.707,186.27 L 35.903,186.547 L 41.51,182.25 L 41.278,182 z M 47.172,177.483 L 41.549,181.793 L 41.78,182.043 L 47.365,177.763 L 47.172,177.483 z M 53.017,173.004 L 47.442,177.276 L 47.635,177.556 L 53.191,173.297 L 53.017,173.004 z M 58.819,168.557 L 53.288,172.795 L 53.462,173.09 L 59.013,168.836 L 58.819,168.557 z M 64.397,164.283 L 59.089,168.349 L 59.283,168.628 L 64.6,164.554 L 64.397,164.283 z M 69.969,160.013 L 64.667,164.076 L 64.871,164.347 L 70.144,160.306 L 69.969,160.013 z M 76.534,154.98 L 70.24,159.804 L 70.415,160.098 L 76.68,155.297 L 76.534,154.98 z M 78.251,153.665 L 76.811,154.769 L 76.956,155.085 L 78.385,153.989 L 78.251,153.665 z M 83.629,149.544 L 78.531,153.451 L 78.665,153.776 L 83.836,149.813 L 83.629,149.544 z M 173.607,149.544 L 173.4,149.814 L 178.572,153.777 L 178.705,153.452 L 173.607,149.544 z M 178.984,153.665 L 178.851,153.99 L 180.281,155.086 L 180.426,154.77 L 178.984,153.665 z M 180.702,154.98 L 180.556,155.297 L 186.822,160.098 L 186.996,159.804 L 180.702,154.98 z M 187.267,160.013 L 187.092,160.307 L 192.365,164.348 L 192.569,164.077 L 187.267,160.013 z M 192.839,164.283 L 192.635,164.554 L 197.952,168.628 L 198.145,168.349 L 192.839,164.283 z M 198.417,168.557 L 198.223,168.836 L 203.774,173.09 L 203.948,172.795 L 198.417,168.557 z M 204.218,173.004 L 204.044,173.298 L 209.601,177.557 L 209.794,177.277 L 204.218,173.004 z M 210.064,177.483 L 209.871,177.762 L 215.455,182.042 L 215.687,181.792 L 210.064,177.483 z M 215.958,182 L 215.727,182.25 L 221.334,186.547 L 221.529,186.27 L 215.958,182 z M 221.798,186.477 L 221.603,186.754 L 226.971,190.868 L 227.176,190.597 L 221.798,186.477 z M 227.446,190.805 L 227.241,191.075 L 232.564,195.155 L 232.763,194.88 L 227.446,190.805 z M 233.033,195.086 L 232.834,195.36 L 238.643,199.812 L 238.823,199.521 L 233.033,195.086 z M 239.092,199.729 L 238.912,200.019 L 243.423,203.476 L 243.631,203.207 L 239.092,199.729 z M 243.901,203.415 L 243.693,203.683 L 248.203,207.14 L 248.431,206.886 L 243.901,203.415 z M 248.701,207.093 L 248.473,207.347 L 250.887,209.197 L 251.093,208.927 L 248.701,207.093 z",
				fillColor : 'black',
				fillOpacity : 0.8,
				scale : 0.1,
				rotation : angle,
				anchor : new google.maps.Point(100, 100)
			};
			var marker = new google.maps.Marker({
					map : map,
					position : point,
					icon : planeSVG
				});
			// stavi marker u listu radi refresha
			airplaneMarkers.push(marker);

			var airplaneID = markers[i].getAttribute("id");
			var point_name = markers[i].getAttribute("point_name");
			var start_time = markers[i].getAttribute("start_time");
			var end_time = markers[i].getAttribute("end_time");
			var alt = markers[i].getAttribute("alt");
			
			var planeInfo = { airplaneID:airplaneID, start_time:start_time, 
				end_time:end_time, alt:(alt/3280.8).toFixed(3),
				lokacija:point };
				

			var html = "<div id='popup'>" + "<b>Tačka: " + point_name + "</b><br/>"
				 + "Flight ID: " + airplaneID + "<br/>"
				 + "Visina aviona: " + (alt/3280.8).toFixed(3) + "km"
				 + "</div>";

			
			var infoWindow = new google.maps.InfoWindow;
			bindInfoWindow(marker, map, infoWindow, html, planeInfo);
		}
	});
}

function bindInfoWindow(marker, map, infoWindow, html, planeInfo) {
	google.maps.event.addListener(marker, 'click', function () {
		infoWindow.setContent(html);
		infoWindow.open(map, marker);
		showPlaneRoute(map, planeInfo.airplaneID);
		fillPlaneInfo(planeInfo);
	});
}

function showPlaneRoute(map, airplaneID) {
	// očisti prijašnju rutu
	if (airplaneRoute === undefined) {}
	else {
		airplaneRoute.setMap(null);
	}

	// dobavi nove dolazne rute
	var routeUrl = "php/route.php?airplaneID=" + airplaneID;
	downloadUrl(routeUrl, function (data) {
		var xml = data.responseXML;
		var points = xml.documentElement.getElementsByTagName("point");

		var routePoints = [];
		for (var i = 0; i < points.length; i++) {
			var lat = points[i].getAttribute("lat");
			var lon = points[i].getAttribute("lon");
			var alt = points[i].getAttribute("alt");
			routePoints.push(new google.maps.LatLng(lat, lon));
		}

		airplaneRoute = new google.maps.Polyline({
				path : routePoints,
				strokeColor : '#FF0000',
				strokeWeight : 2,
				strokeOpacity : 0.7,
				map : map
			});
	});
}

// popunjavanje informacija o avionu
function fillPlaneInfo(planeInfo) {
	var infoText = '<br><br><table class="table table-striped">';
	infoText += "<tr>";
	infoText += "<td><b>ID aviona: </b></td><td>" + planeInfo.airplaneID + "</td>";
	infoText += "</tr>";
	infoText += "<tr>";
	infoText += "<td><b>Početak leta: </b></td><td>" + planeInfo.start_time + "</td>";
	infoText += "</tr>";
	infoText += "<tr>";
	infoText += "<td><b>Vrijeme stizanja leta: </b></td><td>" + planeInfo.end_time + "</td>";
	infoText += "</tr>";
	infoText += "<tr>";
	infoText += "<td><b>Visina aviona: </b></td><td>" + planeInfo.alt + "km</td>";
	infoText += "</tr>";
	infoText += "</table>";
	document.getElementById("avionInfo").innerHTML = infoText;
	
	var centar = planeInfo.lokacija;
	
	if(mapKabina) { mapKabina.setCenter(centar); } 
	else {
		mapKabina = new google.maps.Map(document.getElementById("kabinaView"), {
				center : centar,
				zoom: 13,
				disableDefaultUI : true,
				draggable: false,
				scrollwheel: false, disableDoubleClickZoom: true,
				mapTypeId: google.maps.MapTypeId.SATELLITE
				//,tilt: 45
			});
	}
}

// dobavljanje rezultata obrade preko AJAX-a
function downloadUrl(url, callback) {
	var request = window.ActiveXObject ?
		new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			request.onreadystatechange = doNothing;
			callback(request, request.status);
		}
	};
	request.open('GET', url, true);
	request.send(null);
}

function doNothing() {}