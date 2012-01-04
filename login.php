<?php
/***************************************
$Revision:: 33                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-02-04 13:30:00#$: Date of last commit
***************************************/
/*
donationLog/
login.php
tjs 101221

file version 1.00 

release version 1.00
*/
require_once( "config.php" );
require_once( "Member.class.php" );

session_start();

  $requiredFields = array( "username", "password" );
  $missingFields = array();
  $errorMessages = array();

  $member = new Member( array( 
    //"username" => isset( $_POST["username"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_POST["username"] ) : "",
    //"password" => isset( $_POST["password"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_POST["password"] ) : "",
    "username" => isset( $_GET["username"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_GET["username"] ) : "",
    "password" => isset( $_GET["password"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_GET["password"] ) : "",
  ) );

  foreach ( $requiredFields as $requiredField ) {
    if ( !$member->getValue( $requiredField ) ) {
      $missingFields[] = $requiredField;
    }
  }

  if ( $missingFields ) {
    $errorMessages[] = '<p class="error">There were some missing fields in the form you submitted. Please complete the fields highlighted below and click Login to resend the form.</p>';
  } elseif ( !$loggedInMember = $member->authenticate() ) {
    $errorMessages[] = '<p class="error">Sorry, we could not log you in with those details. Please check your username and password, and try again.</p>';
  }
    
  if ( $errorMessages ) {
    //displayForm( $errorMessages, $missingFields, $member );
    //echo $errorMessages;
    echo $errorMessages[0];
  } else {
    $_SESSION["member"] = $loggedInMember;
    //displayThanks();
    header('Content-Type: text/xml');
echo "<?xml version=\"1.0\" ?><members>";
echo '<member id="'.$loggedInMember->getValue("id").'"><last>'.$loggedInMember->getValue("lastName").'</last><first>'.$loggedInMember->getValue("firstName").'</first></member>';
echo "</members>";

  }
?>

