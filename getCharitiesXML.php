<?php
/***************************************
$Revision:: 95                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-05-11 15:49:19#$: Date of last commit
***************************************/
/*
donationLog/
getCharitiesXML.php
tjs 101221

file version 1.00 

release version 1.00
*/
//http://localhost/~thomassoucy/donationLog/getCharitiesXML.php?maxId=0
//http://localhost/~thomassoucy/donationLog/getCharitiesXML.php?account=0&maxId=0
//http://localhost/~thomassoucy/donationLog/getCharitiesXML.php?account=1&maxId=2012

date_default_timezone_set ( "America/New_York" );

//$account = $_GET['account'];
$account = 0;
$maxId = $_GET['maxId'];
//require_once( "common.inc.php" );
require_once( "Member.class.php" );
//tjs 110511 above ensures that config.php has been loaded as well
$username=DB_USERNAME;
$password=DB_PASSWORD;
$database=DB_NAME;
session_start();
if (isset($_SESSION['member'])) {
	$member = $_SESSION['member'];
	if ($member) {
		$account = $member->getValue( "id" );
	}
	//$account = $member->getValue( "id" );
}
//tjs110310
if ($account == 0) {
	$account = $_GET['account'];
}

//tjs101011
define("MYSQL_HOST", "localhost");

//$username="root";
//$password="root";
//$database="COLLORG";

$con = mysql_connect("".MYSQL_HOST."",$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

/*
e.g. insert
INSERT INTO `charities` (`id`, `memberId`, `charityName`, `shortName`, `dunns`, `url`, `numStars`, `createdDate`, `isInactive`) VALUES
(1, 0, 'A Wider Circle', NULL, NULL, NULL, 0, '2010-11-17 11:05:01', NULL),
(501, 0, 'Yosemite Fund', NULL, NULL, NULL, 0, '2010-11-17 11:05:01', NULL);
*/

//tjs101126
//$query="SELECT count(*) FROM charities where memberId = ".$account;
$query="SELECT id FROM charities where memberId = ".$account;
//echo $query;
$result=mysql_query($query);
$num=mysql_numrows($result);
//echo $num;
if ($num < 1) {
	$query="SELECT * FROM charities where memberId = 0 and isInactive is null";
	$result=mysql_query($query);
	$num=mysql_numrows($result);
	//e.g. 486
	//echo $num;
	if ($num > 0) {
		//$sql="INSERT INTO charities (memberId, charityName, shortName) VALUES ";
		$sql="INSERT INTO charities (memberId, charityName, shortName, baseId, isForProfit) VALUES ";
		$i=0;
		while ($i < $num) {
			$charityId=mysql_result($result,$i,"id");

			$charityName=mysql_result($result,$i,"charityName");
			$shortName=mysql_result($result,$i,"shortName");
			if ($shortName == null) {
				$shortName = ' ';
			}
			$isForProfit=mysql_result($result,$i,"isForProfit");
			if ($isForProfit == null) {
				$isForProfit = '0';
			} else {
				$isForProfit = '1';
			}
			//$sql .= '('.$account.',"'.$charityName.'","'.$shortName.'")';
			$sql .= '('.$account.',"'.$charityName.'","'.$shortName.'",'.$charityId.','.$isForProfit.')';
//echo $sql;
			if ($i < $num - 1) {
				//$sql += "('$account','$charityName','$shortName'),";
				//$sql = $sql + ",";
				$sql .= ",";
			} else {
				//$sql = $sql + ";";
				$sql .= ";";
			}
			$i++;
		}
		//echo $sql;
		if (!mysql_query($sql,$con))
  		{
  			die('Error: ' . mysql_error());
  		}	
	}
	/*
	$i=0;
	while ($i < $num) {
		$charityId=mysql_result($result,$i,"id");

		$charityName=mysql_result($result,$i,"charityName");
		$shortName=mysql_result($result,$i,"shortName");
		
		$sql="INSERT INTO charities (memberId, charityName, shortName)
		VALUES
			('$account','$charityName','$shortName')";
		if (!mysql_query($sql,$con))
  		{
  			die('Error: ' . mysql_error());
  		}
		$i++;
	}
	*/
}

//tjs101122
//header('Content-Type: text/xml, charset=utf-8');
header('Content-Type: application/xml, charset=utf-8');
echo '<?xml version="1.0" encoding="utf-8"?>';
echo "<charities>";
printf("\n");

//model
//	$query="SELECT * FROM charities where memberId = ".$account." and (isInactive is null or isInactive = 0)";
//$query="SELECT * FROM charities where id > ".$maxId." and memberId = ".$account." and isInactive is null";
$query="SELECT * FROM charities where id > ".$maxId." and memberId = ".$account." and (isInactive is null or isInactive = 0)";
//$query="SELECT * FROM charities where memberId = 0 and isInactive is null";
$result=mysql_query($query);
$num=mysql_numrows($result);
$i=0;
while ($i < $num) {
	$charityId=mysql_result($result,$i,"id");
	
	$charityName=mysql_result($result,$i,"charityName");
	$shortName=mysql_result($result,$i,"shortName");
	
	// from donations capture # of Solicitations, # of Donations and Average Amount
	$query="SELECT * FROM donations where memberId = ".$account." and charityId = ".$charityId;
	$result2=mysql_query($query);
	$solicitations=mysql_numrows($result2);
	$j=0;
	//$solicitations = 0;
	$donations = 0;
	$total = 0;
	while ($j < $solicitations) {
		//$id=mysql_result($result2,$j,"id");
		//$charityId=mysql_result($result,$i,"charityId");
		
		$amount=mysql_result($result2,$j,"amount");
		//$date=mysql_result($result,$i,"madeOn");
		//$donation= '<donation id="'.$id.'"><memberId>'.$account.'</memberId><charityId>'.$charityId.'</charityId><amount>'.$amount.'</amount><date>'.$date.'</date></donation>';
		//echo $donation;
		if ($amount > 0) {
			$donations++;
			$total += $amount;
		}
		$j++;
	}
	$average = 0;
	if ($donations > 0) {
		$average = $total/$donations;
	}
	
	$dunns=mysql_result($result,$i,"dunns");
	$dunnsPart = '<dunns/>';
	if (strlen($dunns) > 0)
		$dunnsPart = '<dunns>'.$dunns.'</dunns>';
	$url=mysql_result($result,$i,"url");
	$urlPart = '<url/>';
	if (strlen($url) > 0)
		$urlPart = '<url>'.$url.'</url>';
	$description=mysql_result($result,$i,"description");
	$descriptionPart = '<description/>';
	if (strlen($description) > 0)
		$descriptionPart = '<description>'.$description.'</description>';
	$numStars=mysql_result($result,$i,"numStars");
	$numStarsPart = '<stars>'.$numStars.'</stars>';

	//tjs110310
	$baseId=mysql_result($result,$i,"baseId");
	$baseIdPart = '<baseId/>';
	if (strlen($baseId) > 0)
		$baseIdPart = '<baseId>'.$baseId.'</baseId>';
	$isInactive=mysql_result($result,$i,"isInactive");
	$isInactivePart = '<isInactive/>';
	if (strlen($isInactive) > 0)
		$isInactivePart = '<isInactive>'.$isInactive.'</isInactive>';
	$isForProfit=mysql_result($result,$i,"isForProfit");
	$isForProfitPart = '<isForProfit/>';
	if (strlen($isForProfit) > 0)
		$isForProfitPart = '<isForProfit>'.$isForProfit.'</isForProfit>';
	
	//printf("<charity id=\"%s\" solicitations=\"%s\" donations=\"%s\" average=\"%s\"><charityName>%s</charityName><shortName>%s</shortName>%s%s%s%s</charity>\n", $charityId, $solicitations, $donations, $average, $charityName, $shortName, $dunnsPart, $urlPart, $descriptionPart, $numStarsPart);
	printf("<charity id=\"%s\" solicitations=\"%s\" donations=\"%s\" average=\"%s\"><charityName>%s</charityName><shortName>%s</shortName>%s%s%s%s%s%s%s</charity>\n", $charityId, $solicitations, $donations, $average, $charityName, $shortName, $dunnsPart, $urlPart, $descriptionPart, $numStarsPart, $baseIdPart, $isInactivePart, $isForProfitPart);
	
	$i++;
}

mysql_close();
echo "</charities>";

?> 



