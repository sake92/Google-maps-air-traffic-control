<?php
// link za testiranje flights.php?latMin=40&latMax=46&lonMin=15&lonMax=20&maxFlights=10
require("dbFlights.php");

// Otvaranje konekcije na MySQL server
$connection = mysqli_connect ($server, $username, $password, $database);
if (!$connection) {
	die('Not connected : ' . mysqli_error());
}
mysqli_set_charset($connection, 'utf8');

// Selektovanje svih trajektorija koje odgovaraju letovima koji su u toku
$query = "SELECT OID, TPOINTS, TIME(FROM_UNIXTIME(TSTARTTIME)) AS start_time, ";
$query .= "TIME(FROM_UNIXTIME(TENDTIME)) AS end_time FROM flights WHERE ";
$query .= "TIME(FROM_UNIXTIME(TSTARTTIME))<CURTIME() AND TIME(FROM_UNIXTIME(TENDTIME))>CURTIME()";
$result = mysqli_query($connection, $query);
if (!$result) {
  die('Invalid query: ' . mysqli_error());
}

// dobavljanje okvira prozora radi optimizacije
$latMin = $_REQUEST['latMin'];
$latMax = $_REQUEST['latMax'];
$lonMin = $_REQUEST['lonMin'];
$lonMax = $_REQUEST['lonMax'];
// maksimalni broj aviona za prikaz
$maxFlights = $_REQUEST['maxFlights'];

// Kreiranje XML-a
// Parent node za XML
$dom = new DOMDocument("1.0");
$node = $dom->createElement("airplanes");
$parnode = $dom->appendChild($node);

header("Content-type: text/xml");

$planesCounter = 0;
// Dodavanje markera za svaki avion
while ($row = @mysqli_fetch_assoc($result)) {
	$start_time = $row['start_time'];

	// traženje trenutne tačke
	$points = explode(";", $row['TPOINTS']);
	for($i=0; $i<count($points); $i++) {
		$params = explode(",", $points[$i]);
		if(count($params) == 5) {
			$lat = $params[0];
			$lon = $params[1];
			$alt = $params[2];
			$timeoffset = $params[3];
			$point_name = $params[4];
			
			// traženje trenutne tačke u kojoj se avion nalazi
			$currPointTime = strtotime($start_time) + $timeoffset;
			if($i>0 && $currPointTime > time()) {
				$params = explode(",", $points[$i-1]);
				$lat1ForAngle = $params[0];	// za računanje ugla
				$lon1ForAngle = $params[1];
				break;
			}
		}
	}
		
	// preskoči avione koji nisu u okviru prozora
	if($lat < $latMin || $lat > $latMax || 
		$lon < $lonMin || $lon > $lonMax) continue;
		
	$node = $dom->createElement("airplane");
	$airplaneNode = $parnode->appendChild($node);
	$airplaneNode -> setAttribute("id", $row['OID']);
	$airplaneNode -> setAttribute("start_time", $start_time);
	$airplaneNode -> setAttribute("end_time", $row['end_time']);
	
	$airplaneNode -> setAttribute("lat", $lat);
	$airplaneNode -> setAttribute("lon", $lon);
	$airplaneNode -> setAttribute("alt", $alt);
	$airplaneNode -> setAttribute("point_name", $point_name);
	
	$angle = getAngle($lat1ForAngle, $lon1ForAngle, $lat, $lon);
	$airplaneNode -> setAttribute("angle", $angle);
	
	$planesCounter++;
	if($planesCounter==$maxFlights) break;
}

// upis u XML
echo $dom->saveXML();

function getAngle($lat1, $lon1, $lat2, $lon2) {
    $angle = atan2($lon2 - $lon1, $lat2 - $lat1);
    return rad2deg($angle);
}
?>