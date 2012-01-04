<?php
/***************************************
$Revision:: 95                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-05-11 15:49:19#$: Date of last commit
***************************************/
/*
donationLog/
donations.php
tjs 101224

file version 1.00 

release version 1.00
*/
// memberId 1 is SteelDrum
//add
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=5&charityId=5&remove=false&id=0
//alter
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=15&charityId=5&remove=false&id=1
//delete
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=5&charityId=5&remove=true&id=1

//$account = $_GET['account'];
require_once( "Member.class.php" );
//tjs 110511 above ensures that config.php has been loaded as well
$username=DB_USERNAME;
$password=DB_PASSWORD;
$database=DB_NAME;
session_start();
//if (isset($_SESSION['loginAccountNumber'])) {
//	$account = $_SESSION['loginAccountNumber'];
//}
$account = 0;
if (isset($_SESSION['member'])) {
	$member = $_SESSION['member'];
	$account = $member->getValue( "id" );
} 

$id = $_GET['id'];
$remove = $_GET['remove'];

//tjs101011
//define("MYSQL_HOST", "localhost");
//$username="root";
//$password="root";
//$database="COLLORG";

$con = mysql_connect('localhost',$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

if ($id == 0) {
// add the new donation
//$date =   date( "Y-m-d" );

$sql="INSERT INTO donations (charityId, memberId, amount)
VALUES ('$_GET[charityId]','$account','$_GET[amount]')";
} else {
	if ($remove == 'true') {
$sql = "DELETE FROM donations WHERE id = $id";
	} else {
$sql = "UPDATE donations SET amount = '$_GET[amount]', madeOn = '$_GET[date]' WHERE id = $id";
	}
}

if (!mysql_query($sql,$con))
  {
  die('Error: ' . mysql_error());
  }

mysql_close();

?> 


