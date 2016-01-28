<?php
require("db.php");

// Otvaranje konekcije na MySQL server
$connection = mysqli_connect ($server, $username, $password, $database);
if (!$connection) {
	die('Not connected : ' . mysqli_error());
}
mysqli_set_charset($connection, 'utf8');

// dobavljanje parametara, okvir prozora
$latMin = $_REQUEST['latMin'];
$latMax = $_REQUEST['latMax'];
$lonMin = $_REQUEST['lonMin'];
$lonMax = $_REQUEST['lonMax'];

// Selektovanje svih aerodroma koji se nalaze u granicama prozora
$query = "SELECT * FROM airports WHERE ";
$query .= "(Latitude BETWEEN $latMin AND $latMax)";
$query .= " AND (Longitude BETWEEN $lonMin AND $lonMax)";
$result = mysqli_query($connection, $query);
if (!$result) {
  die('Invalid query: ' . mysqli_error());
}

// Kreiranje XML-a
// Parent node za XML
$dom = new DOMDocument("1.0");
$node = $dom->createElement("markers");
$parnode = $dom->appendChild($node);

header("Content-type: text/xml");

// Dodavanje markera za svaki aerodrom
while ($row = @mysqli_fetch_assoc($result)){
  $node = $dom->createElement("marker");
  $newnode = $parnode->appendChild($node);
  $newnode->setAttribute("name", $row['Name']);
  $newnode->setAttribute("city", $row['City']);
  $newnode->setAttribute("country", $row['Country']);
  $newnode->setAttribute("lat", $row['Latitude']);
  $newnode->setAttribute("lng", $row['Longitude']);
  $newnode->setAttribute("AirportID", $row['AirportID']);
}

echo $dom->saveXML();

?>