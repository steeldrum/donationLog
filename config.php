<?php
/***************************************
$Revision:: 96                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-05-12 08:42:17#$: Date of last commit
***************************************/
/*
donationLog/
config.php
tjs 101221

file version 1.00 

release version 1.00
*/
/*
 tjs 110512 moved sql to new database CHARITYHOUND
//tjs 101221
define( "DB_DSN", "mysql:dbname=COLLORG" );
//tjs 110511
define( "DB_NAME", "COLLORG" );
*/
define( "DB_DSN", "mysql:dbname=CHARITYHOUND" );
define( "DB_NAME", "CHARITYHOUND" );
define( "DB_USERNAME", "root" );
//define( "DB_PASSWORD", "mypass" );
define( "DB_PASSWORD", "root" );
define( "PAGE_SIZE", 5 );
define( "TBL_MEMBERS", "members" );
define( "TBL_ACCESS_LOG", "accessLog" );
?>
