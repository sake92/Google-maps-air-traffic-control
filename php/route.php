<?php
require("dbFlights.php");

// Otvaranje konekcije na MySQL server
$connection = mysqli_connect ($server, $username, $password, $database);
if (!$connection) {
	die('Not connected : ' . mysqli_error());
}
mysqli_set_charset($connection, 'utf8');

// dobavljanje okvira prozora radi optimizacije
$airplaneID = $_REQUEST['airplaneID'];

// Selektovanje svih trajektorija koje odgovaraju letovima koji su u toku
$query = "SELECT TPOINTS FROM flights WHERE ";
$query .= "OID=$airplaneID";
$result = mysqli_query($connection, $query);
if (!$result) {
  die('Invalid query: ' . mysqli_error());
}

// Kreiranje XML-a
// Parent node za XML
$dom = new DOMDocument("1.0");
$node = $dom->createElement("points");
$parnode = $dom->appendChild($node);

header("Content-type: text/xml");

// Dodavanje markera za svaki aerodrom
while ($row = @mysqli_fetch_assoc($result)) {
	$points = explode(";", $row['TPOINTS']);
	for($i=0; $i<count($points); $i++) {
		$params = explode(",", $points[$i]);
		if(count($params) == 5) {
			$lat = $params[0];
			$lon = $params[1];
			$alt = $params[2];
			
			$node = $dom->createElement("point");
			$pointNode = $parnode->appendChild($node);
			$pointNode -> setAttribute("lat", $lat);
			$pointNode -> setAttribute("lon", $lon);
			$pointNode -> setAttribute("alt", $alt);		
		}
	}
  
}

echo $dom->saveXML();

?>