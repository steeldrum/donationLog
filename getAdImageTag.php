<?php
/***************************************
$Revision:: 95                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-05-11 15:49:19#$: Date of last commit
***************************************/
/*
donationLog/
getAdImageTag.php
tjs 110103

file version 1.00 

release version 1.00
*/
/*  test
http://localhost/~thomassoucy/donationLog/getAdImageTag.php
*/

/*
//todo later on adjust number of selected images dynamically
$select = rand(1,2);
//default image ad...
$imgloc= "images/collogisticsAd.png";
//$imgalt= "Consider Collogistics";
$imgalt= "Consider Collogistics While Giving...";
if ($select == 1) {

} else {
	//$imgloc= "images/some-ad.gif";
	//$imgalt= "Apress sales. 20% off on all books.";
	$imgloc= "images/QuillessAssociates.png";
	$imgalt= "Don't go Clueless. Consider Quilless!";
}
INSERT INTO `ads` (`id`, `memberId`, `adType`, `adName`, `width`, `height`, `tabLine`, `numDisplayed`, `displayedDate`, `circulationNumber`, `description`, `numOccurences`, `perOccurence`, `expirationDate`, `createdDate`, `circulationWeight`, `isInactive`) VALUES
(1, 1, 'mobile', 'collogisticsAd.png', 320, 50, 'Consider Collogistics While Giving...', 0, '2010-10-12', 0, 'demo for collogistics site', 0, 0, '2020-01-01', '2010-10-12', 0, NULL),
(2, 1, 'mobile', 'QuillessAssociates.png', 320, 50, "Don't Go Clueless. Consider Quilless!", 0, '2010-10-12', 0, 'demo for collogistics site', 0, 0, '2020-01-01', '2010-10-12', 0, NULL);

*/
//tjs 110511
require_once( "config.php" );
//tjs 110511 above ensures that config.php has been loaded
$username=DB_USERNAME;
$password=DB_PASSWORD;
$database=DB_NAME;

define("MYSQL_HOST", "localhost");

//$username="root";
//$password="root";
//$database="COLLORG";

$con = mysql_connect("".MYSQL_HOST."",$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

$query="SELECT * FROM ads where isInactive is NULL order by circulationWeight desc, circulationNumber";
//echo $query;
//$result=mysql_query($query);
$result=mysql_query($query, $con);
//$num_rows = mysql_num_rows($result);
//$num=mysql_numrows($result);
$num=mysql_num_rows($result);
//echo $num;
$i=0;
//defaults...
$imgloc = 'collogisticsAd.png';
$imgalt = 'Consider Collogistics While Giving...';
$imgwidth = 320;
$imgheight = 50;
$adId = 0;
$weightedAdCount = 0;
$weightedAdIds = array();
$weightedCirculationNumbers = array();
$weightedAdNames = array();
$weightedTabLines = array();
$weightedweights = array();
$circulatedAdId = 0;
$circulatedCirculationNumber = 0;
$circulatedAdName = 'collogisticsAd.png';
$circulatedTabLine = 'Consider Collogistics While Giving...';
$circulationNumber = 0;
while ($i < $num) {
	$adId = mysql_result($result,$i,"id");
	$circulationNumber = mysql_result($result,$i,"circulationNumber");
	$circulationWeight = mysql_result($result,$i,"circulationWeight");
	$adName = mysql_result($result,$i,"adName");
	$tabLine = mysql_result($result,$i,"tabLine");
	if ($circulationWeight > 0) {
		$weightedAdIds[$weightedAdCount] = $adId;
		$weightedCirculationNumbers[$weightedAdCount] = $circulationNumber;
		$weightedAdNames[$weightedAdCount] = $adName;
		$weightedTabLines[$weightedAdCount] = $tabLine;
		$weightedweights[$weightedAdCount] = $circulationWeight;
		$weightedAdCount++;
	} else if ($circulatedAdId == 0){
		$circulatedAdId = $adId;
		$circulatedCirculationNumber = $circulationNumber;
		$circulatedAdName = $adName;
		$circulatedTabLine = $tabLine;
	}
	$i++;
}

$select = rand(1,2);
$adId = 0;
//half the time choose a weighted ad (if there are any)...
if ($select == 1 && $weightedAdCount > 0) {
	$maxWeight = $weightedweights[0];
	$weightRangeChoice = rand(1,$maxWeight);
	$integerWeight = round($weightRangeChoice);
	for( $j = 0; $j < $weightedAdCount; $j++) {
		$weightedCirculationNumber = $weightedCirculationNumbers[$j];
		if ($adId == 0 && $integerWeight > $weightedweights[$j]) {
			if ($circulationNumber - $weightedCirculationNumber > $weightedAdCount) {
				$adId = $weightedAdIds[$j];
				$imgloc = $weightedAdNames[$j];
				$imgalt = $weightedTabLines[$j];
				//todo width, height				
			}
		}
	}
	if ($adId == 0) {
		$adId = $weightedAdIds[$weightedAdCount - 1];
		$imgloc = $weightedAdNames[$weightedAdCount - 1];
		$imgalt = $weightedTabLines[$weightedAdCount - 1];
	}
} else {
	$adId = $circulatedAdId;
	$imgloc = $circulatedAdName;
	$imgalt = $circulatedTabLine;
}

// $circulationNumber now has the last (or highest value)
$circulationNumber++;
$sql = "UPDATE ads SET circulationNumber = ".$circulationNumber." WHERE id = ".$adId;
if (!mysql_query($sql,$con))
  {
  die('Error: ' . mysql_error());
  }

mysql_close();

echo '<img id="adImageTag" src="images/'.$imgloc.'" alt="'.$imgalt.'" width="320" height="50">';

?>
