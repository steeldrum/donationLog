/***************************************
$Revision:: 167                        $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-12-19 18:07:37#$: Date of last commit
***************************************/
/* 
donationLog/scripts/
donationLog.js
tjs 101221
file version 1.00 
release version 1.00
*/
/*
api references:
http://www.datatables.net/api
*/

function getXMLHTTPRequest() 
{
	var req = false;
	try 
	  {
	   req = new XMLHttpRequest(); /* e.g. Firefox */
	  } 
	catch(err1) 
	  {
	  try 
		{
		 req = new ActiveXObject("Msxml2.XMLHTTP");  /* some versions IE */
		} 
	  catch(err2) 
		{
		try 
		  {
		   req = new ActiveXObject("Microsoft.XMLHTTP");  /* some versions IE */
		  } 
		  catch(err3) 
			{
			 req = false;
			} 
		} 
	  }
	return req;
}

function requestXMLData(url, responseHandler) {
	myRequest.open("GET", url, true);
	myRequest.onreadystatechange = responseHandler;
	// send the request
	myRequest.send(null);
}

function requestXMLData(myRequest, url, responseHandler) {
	var myRandom=parseInt(Math.random()*99999999);
	//myRequest.open("GET", url, true);
	myRequest.open("GET", url + "&rand=" + myRandom, true);
	myRequest.onreadystatechange = responseHandler;
	// send the request
	myRequest.send(null);
}

//tjs101123
function postRequestXMLData(myRequest, url, responseHandler) {
	var myRandom=parseInt(Math.random()*99999999);
	//myRequest.open("GET", url, true);
	myRequest.open("POST", url + "&rand=" + myRandom, true);
	myRequest.onreadystatechange = responseHandler;
	// send the request
	myRequest.send(null);
}

//101213
function removeSpaces(string) {
   return string.split(' ').join('');
}

/*
'CREATE TABLE IF NOT EXISTS charities ' +
					' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
					' memberId INTEGER NOT NULL, charityName TEXT NOT NULL, ' +
					' shortName TEXT DEFAULT NULL, dunns TEXT DEFAULT NULL, ' +
					' url TEXT DEFAULT NULL, description TEXT DEFAULT NULL, ' +
					' numStars INTEGER NOT NULL, createdDate DATE NOT NULL, ' +
					' isInactive INTEGER DEFAULT NULL );
*/

//tjs111215
function loadCharities() {

//todo check if already loaded and bypass if so

	//at this point the client side database has been synchronized with the server's
	//use the client side database to populate the donations lists
	var donationHtml = '<ul><li></li></ul>';
	
	//charities.clear();
	//alert("charity refreshCharities clear charities...");
	//Array.clear(charities);
	var charities = new Array();
	var charity;
	//alert("charity refreshCharities selecting client side charities...");
	db.transaction(
		function(transaction) {
			transaction.executeSql(
				"SELECT * FROM charities ORDER BY charityName;",
				null,
				function (transaction, result) {
					//alert("charity loadCharities number of active charities " + result.rows.length);
					// e.g. 492
					for (var i=0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						var charityId = row.id;
						var memberId = row.memberId;
						var charityName = row.charityName;
						var amount = 0;
						// function Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive) {
						var shortName = row.shortName;
						var dunns = row.dunns;
						var url = row.url;
						var description = row.description;
						var numStars = row.numStars;
						var createdDate = row.createdDate;
						var isInactive = row.isInactive;
						//if (i % 100 == 0) {
						//	alert("charity loadCharities i " + i + " memberId " + memberId + " charityId " + charityId);
						//}
						
						charity = new Charity(charityId, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive);
						//if (i % 100 == 0) {
						//	alert("charity loadCharities memberId " + charity.memberId + " charityId " + charity.id);
						//}
						charities.push(charity);
					}
					
					//we now have charities loaded in memory array from the client side RDB
					var len = charities.length;
					//alert("charity loadCharities charities len " + len + " torf " + torf);
					//alert("charity loadCharities charities len " + len);
					
					//tjs 111215
					// tjs 111219 add back in...
					var numberSections = 6;
					var sectionLetter;
					var startLetter;
					var lastSectionLetter;
					var finalSectionLetter;
					//var sectionLetters = new Array(numberSections);
					//assumes at least five charities!
					var thresholdSectionLen = Math.round(len/numberSections);
					var sectionCount = 0;
					var nameCount = 0;
					var minNameCount = 1;
					var excessLettersCount = 0;
					//assumes always have at least one charity that starts with an 'A'!
					lastSectionLetter = "A";
					sectionLetters[sectionCount++] = lastSectionLetter;
					var armed = false;
					var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
					
					//tjs101228
					var letterLengths = { "A":0, "B": 0, "C":0, "D":0, "E":0, "F":0, "G":0, "H":0, "I":0, "J":0, "K":0, "L":0, "M":0, "N":0, "O":0, "P":0, "Q":0, "R":0, "S":0, "T":0, "U":0, "V":0, "W":0, "X":0, "Y":0, "Z":0 };
					var letterLength = 0;
					var lastLetter = "A";
					
					// tjs 120308
					//tjs 111223
					//donationHtml = '<ul data-role="listview" id="charities-list" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';

					//make initial pass thru array to derive information for n sections
					for (i = 0; i < len; i++) {
						charity = charities[i];
						var charityName = charity.charityName;
						startLetter = charityName.substring(0,1);
						letterLength++;
						if (alphabet.indexOf(startLetter) >= 0 && startLetter != lastLetter) {
							letterLengths[lastLetter] = letterLength;
							lastLetter = startLetter;
							letterLength = 0;
						}
					}
					//alert("donationLog loadCharities len " + len + " thresholdSectionLen " + thresholdSectionLen + " sectionCount " + sectionCount);
					numberSections = 11;
					thresholdSectionLen = Math.round(len/numberSections);
					sectionCount = 0;
					var cumulativeLength = 0;
					var keys = new Array();
					for(key in letterLengths)
					{
						keys.push(key);
						cumulativeLength += letterLengths[key];
						var offset = Math.round(cumulativeLength/thresholdSectionLen);
						if (offset > sectionCount) {
							var keyLabel = '';
							if (sectionCount == 10) {
								keyLabel = keys[0] + '-Z';
							} else {
								for (var i = 0; i < keys.length; i++) {
									keyLabel += keys[i];
									if (i < keys.length - 1) {
										keyLabel += ', ';
									}
								}
							}
							sectionRanges[sectionCount] = keyLabel;
							sectionLetters[sectionCount++] = keys[0];
							keys.length = 0;
						} 					
					   //alert("donationLog loadCharities key " + key + " has value " + letterLengths[key]);
					}
					//alert("donationLog loadCharities temp " + temp);
					//alert("charity loadCharities first charity id " + charity.id);
					//len = charities.length;
					//alert("charity loadCharities charities len2 " + len);
					var k = 0;
					for (i = 0; i < len; i++) {
						charity = charities[i];
						var charityId = charity.id;
						var memberId = charity.memberId;
						var charityName = charity.charityName;
						var startLetter = charityName.substring(0,1);
						for (j = k; j < numberSections; j++) {
							if (startLetter == sectionLetters[j]) {
									// tjs 120308
									if (k > 0) {
										// tjs 130101 ???
										//donationHtml += "</ul>";
										charitiesHtml.push(donationHtml);
									}
								++k;
									//donationHtml = '<ul data-role="listview" id="' + startLetter + 'L" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
									donationHtml = '';
								break;
							}
						}
						var amount = 0;
						// tjs 130102
						//donationHtml += '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a class="ui-icon-nonprofit" href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)" data-role="button" data-theme="c">Zero Donation</a></li>';
						donationHtml += '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)" data-role="button" data-theme="c">Zero Donation</a></li>';
					}
					// tjs 120309 get the last letter section...
					//donationHtml += "</ul>";
					charitiesHtml.push(donationHtml);
				},
				errorHandler
			);
		}
	);
}

// tjs 130107
// tjs 130102
//var newPageHtml;
function loadAllCharities() {

	//todo check if already loaded and bypass if so

		//at this point the client side database has been synchronized with the server's
		//use the client side database to populate the donations lists
		var donationHtml = '';
		
		//alert("charity loadAllCharities clear charities...");
		var charities = new Array();
		var charity;
		//alert("charity loadAllCharities selecting client side charities...");
		db.transaction(
			function(transaction) {
				transaction.executeSql(
					"SELECT * FROM charities ORDER BY charityName;",
					null,
					function (transaction, result) {
						//alert("charity loadAllCharities number of active charities " + result.rows.length);
						// e.g. 492
						if (charitiesHtml.length == 0) {
						for (var i=0; i < result.rows.length; i++) {
							var row = result.rows.item(i);
							var charityId = row.id;
							var memberId = row.memberId;
							var charityName = row.charityName;
							var amount = 0;
							// function Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive) {
							var shortName = row.shortName;
							var dunns = row.dunns;
							var url = row.url;
							var description = row.description;
							var numStars = row.numStars;
							var createdDate = row.createdDate;
							var isInactive = row.isInactive;
							//if (i % 100 == 0) {
							//	alert("charity loadCharities i " + i + " memberId " + memberId + " charityId " + charityId);
							//}
							
							charity = new Charity(charityId, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive);
							//if (i % 100 == 0) {
							//	alert("charity loadCharities memberId " + charity.memberId + " charityId " + charity.id);
							//}
							charities.push(charity);
						}
						
						//we now have charities loaded in memory array from the client side RDB
						var len = charities.length;
						//alert("charity loadCharities charities len " + len + " torf " + torf);
						//alert("charity loadAllCharities charities len " + len);
						
						//make initial pass thru array to derive information for n sections
						var k = 0;
						for (var i = 0; i < len; i++) {
							charity = charities[i];
							var charityId = charity.id;
							var memberId = charity.memberId;
							var charityName = charity.charityName;
							var amount = 0;
							// tjs 130102
							//donationHtml += '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a class="ui-icon-nonprofit" href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)" data-role="button" data-theme="c">Zero Donation</a></li>';
							// tjs 130203
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)" data-role="button" data-theme="c">Zero Donation</a></li>';
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="#logSolicitation" data-rel="popup" data-role="button" data-inline="true">Zero Donation</a></li>';
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="#logSolicitation" data-rel="popup" data-role="button" data-inline="true">Zero Donation</a></li>';
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="#logSolicitation" data-rel="popup">Zero Donation</a></li>';
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="#logSolicitation?memberId=1&charityId=0" data-rel="popup">Zero Donation</a></li>';
							//donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="#logSolicitation" data-rel="popup">Zero Donation</a></li>';
							donationHtml = '<li id="' + charityId + '"><a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a><a href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)">Zero Donation</a></li>';
							charitiesHtml.push(donationHtml);
						}
						
						// tjs 130107
						var newPageHtml;
						// tjs 130105
						//newPageHtml = '<div data-role="page" id="charities-page" data-title="Charities" data-theme="b" data-dom-cache="true">';
						//newPageHtml += '<div data-role="header"><a href="#home-page" data-icon="arrow-l">Back</a><h1>Charities</h1></div>';
						//newPageHtml += '<div data-role="content">';
						// tjs 130109
						//newPageHtml = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-split-theme="d" data-split-icon="arrow-r">';
						newPageHtml = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-split-theme="d" data-split-icon="refresh">';
						for (var i = 0; i < charitiesHtml.length; i++) {
							newPageHtml += charitiesHtml[i];
						}		
						newPageHtml += '</ul>';
						// tjs 130105 surpress
						/*
						//<!-- Donate Nothing Page/Popup -->
						newPageHtml += '<div data-role="popup" id="logSolicitation">';
						newPageHtml += '<div data-role="header">';
						newPageHtml += '<h1>Log Solicitation</h1>';
						newPageHtml += '</div>';
						newPageHtml += '<div data-role="content" class="poppy">';
						newPageHtml += 'Logging solicitation here ...';
						newPageHtml += '</div>';
						newPageHtml += '</div><!-- popup -->';
						newPageHtml += '</div><!-- content -->';
						newPageHtml += '</div><!-- /page -->';
*/
						//alert("loadAllCharities newPageHtml " + newPageHtml);
						} // if charitiesHtml length zero
						
						// tjs 130105 surpress
						/*
						var newPage = $(newPageHtml);
						//add new page to page container
						newPage.appendTo($.mobile.pageContainer);

					    // tjs 130103
						//$( "#logSolicitation" ).popup({ theme: "c", overlayTheme: "a" });

						// enhance and open the new page
					    $.mobile.changePage(newPage);

					    // tjs 130103
						//$( "#logSolicitation" ).popup({ theme: "c", overlayTheme: "a" });
						
						// tjs 130104
						//$( "#logSolicitation" ).bind({
						//	   popupbeforeposition: function(event, ui) { alert("popupbeforeposition for logSolicitation..."); }
						//});
						*/
						charitiesListHtml = newPageHtml;
					},
					errorHandler
				);
			}
		);
	}

// tjs 130105
function assignCharitiesListHtml() {
	loadAllCharities();
}

//add
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=5&charityId=5&remove=false&id=0
//alter
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=15&charityId=5&remove=false&id=1
//delete
//http://localhost/~thomassoucy/philanthropy/donations.php?account=1&amount=5&charityId=5&remove=true&id=1
function doAmountTransaction(trxType, charityId, memberId, id, newAmount, newDate) {
	//alert ("charity doAmountTransaction charity id " + charityId + " member id " + memberId);
	//alert ("charity doAmountTransaction charity id " + charityId + " member id " + memberId + " id " + id + " new amount " + newAmount + " new date " + newDate);
	var queryStr;
	var amount = 0;
	var remove = 'false';
	if (trxType == 2)
		remove = 'true';	
    amount = newAmount;

	var donationsRequest = getXMLHTTPRequest();
	//url = 'ccGetCustomersXML.php?account=' + loginAccountNumber;
	//var url = 'donations.php?account=' + loginAccountNumber;
	var url = 'donations.php?account=' + memberId + '&amount=' + amount + '&charityId=' + charityId + '&remove=' + remove + '&id=' + id;
	if (newDate != null) {
		url += '&date=' + newDate;
	}
	//alert("donationLog doAmountTransaction url " + url);
	requestXMLData(donationsRequest, url, function() {
	   if(donationsRequest.readyState == 4) {
		// if server HTTP response is "OK"
	//alert("ccJobCost refreshCustomers readyState 4 customerRequest.status " + customerRequest.status);
			if(donationsRequest.status == 200) {
				//var data = donationsRequest.responseXML;
				//alert("donationLog doAmountTransaction done.");
		
			} else {
				// issue an error message for any other HTTP response
				alert("An error has occurred: " + donationsRequest.statusText);
			}
	    }
	});
}

/*
<donations>
<donation id="10">
<memberId>0</memberId>
<charityId>4</charityId>
<amount>444</amount>
<date>2010-11-19 16:06:45</date>
</donation>
</donations>
*/
function addDonation(memberId, charityId, amount) {
//alert("addDonation memberId " + memberId + " charityId " + charityId + " amount " + amount);
	// tjs 130108
	//document.donationForm.charityId.value = charityId;
	//document.donationForm.memberId.value = memberId;
	//document.donationForm.amount.value = amount;
	//document.donationForm.amount.disabled = '';
	document.makeDonationForm.charityId.value = charityId;
	document.makeDonationForm.memberId.value = memberId;
	// tjs 130109
	document.makeDonationForm.amount.value = 0;
	document.makeDonationForm.cancelled.value = 'false';
	document.makeDonationForm.confidential.checked = "";
	document.makeDonationForm.reminderSchedule.checked = "";
	document.makeDonationForm.blankEnvelope.checked = "";
	document.makeDonationForm.currencyInEnvelope.checked = "";
	// tjs 130109
	//$( "#makeDonation" ).popup({ theme: "c", overlayTheme: "a" });
	//$( "#makeDonation" ).popup( "open" );
	$( "#makeDonation" ).popup( "open", { theme: "c", overlayTheme: "a" } );

	//alert("donationLog addDonation amount " + amount + " memberId " + memberId + " charityId " + charityId);
	//charity modifyDonation amount 0 date 2010-11-10 00:00:00 madeOn 2010-12-04

	//$("#donationDialog").dialog("open");
	//donate-dial
	//$("#donate-dial").dialog("open");
	// tjs 130102 use popup instead...
	//$.mobile.changePage("#donate-dial");
}

/*
 * DOM NOTES:
 * This html:
 * <li id="' + charityId + '">
 * 	<a href="javascript:addDonation(' + memberId + ', ' + charityId + ', 0)">' + charityName + '</a>
 *  <a class="ui-icon-nonprofit" href="javascript:addSolicitation(' + memberId + ', ' + charityId + ', 0)" data-role="button" data-theme="c">Zero Donation</a>
 * </li>';
e.g. jqm "enhanced" dom:
<li id="536" data-theme="b" class="ui-btn ui-btn-icon-right ui-li ui-li-has-alt ui-btn-up-b">
	<div class="ui-btn-inner ui-li ui-li-has-alt">
		<div class="ui-btn-text">
			<a href="javascript:addDonation(1, 536, 0)" class="ui-link-inherit">AARP Foundation</a>
		</div>
	</div>
	<a class="ui-icon-nonprofit ui-li-link-alt ui-btn ui-btn-up-b" href="javascript:addSolicitation(1, 536, 0)" data-role="button" data-theme="b" title="Zero Donation">
		<span class="ui-btn-inner">
			<span class="ui-btn-text"/>
			<span title="" data-theme="c" class="ui-btn ui-btn-up-c ui-btn-icon-notext ui-btn-corner-all ui-shadow">
				<span class="ui-btn-inner ui-btn-corner-all">
					<span class="ui-btn-text"/>
					<span class="ui-icon ui-icon-refresh ui-icon-shadow"/>
				</span>
			</span>
		</span>
	</a>
</li>
 */
function addSolicitation(memberId, charityId, amount) {
	// this mimics providing the user with feedback that the click occurred
	//alert('donationLog currentTheme before query...');
	// change icon to a check...
	// e.g. Adopt 1 538
	//alert('donationLog addSolicitation memberId ' + memberId + " charityId " + charityId);
	// tjs 130102 use popup instead...
	// cf 	$( "#login-dial" ).popup( "open" ).trigger( "create" );
	// tjs 130104 for debug
	//var elm = $( "#logSolicitation" );
	//if (elm == null) {
	//	alert("donationLog addSolicitation elm null!");
	//}
	//$( "#logSolicitation" ).popup({ theme: "c", overlayTheme: "a" });
	document.solicitationLogForm.charityId.value = charityId;
	document.solicitationLogForm.memberId.value = memberId;
	document.solicitationLogForm.cancelled.value = 'false';
	document.solicitationLogForm.blankEnvelope.checked = "";
	document.solicitationLogForm.currencyInEnvelope.checked = "";
	// tjs 130109
	//$( "#logSolicitation" ).popup({ theme: "c", overlayTheme: "a" });
	//$( "#logSolicitation" ).popup( "open" );
	$( "#logSolicitation" ).popup( "open", { theme: "c", overlayTheme: "a" } );
	//$( "#logSolicitation" ).popup( "open", { theme: "c", overlayTheme: "a", transition: "slide", positionTo: "window" } );
	//			<div data-role="popup" id="popupPanel" data-corners="false" data-theme="none" data-shadow="false" data-tolerance="0,0">
	//$( "#logSolicitation" ).popup( "open", { theme: "none", corners: "false", transition: "slideLeft", tolerance: "0,0", positionTo: "window" } );
	//$( "#logSolicitation" ).popup( "open", { transition: "slideLeft", positionTo: "window" } );
	// tjs 130107 NOK
	//$("#logSolicitation input[type='checkbox']").checkboxradio("refresh");
	//$( "#solicitationCheckboxSet" ).trigger( "create" );
	
	//alert('donationLog addSolicitation memberId ' + memberId + " amount " + amount);
	
	//$('#' + charityId + ' :nth-child(2)').find('.ui-icon-refresh').removeClass('ui-icon-refresh').addClass('ui-icon-check');
	//alert('donationLog currentTheme after query...');
	// do the actual solicitation log
	// tjs 130103 for now out
	//doAmountTransaction(0, charityId, memberId, 0, amount);
	//alert('donationLog addSolicitation charityId ' + charityId);
	// pause 1/2 second changing the icon back to the original 'refresh' state (used in lieu of no recycle icon)
	// tjs 130102 use popup instead...
	/*setTimeout(function() {
		//alert('donationLog addSolicitation re-enable');
		$('#' + charityId + ' :nth-child(2)').find('.ui-icon-check').removeClass('ui-icon-check').addClass('ui-icon-refresh');
		},500);*/
}

// tjs 130108
function cancelDonation() {
	document.makeDonationForm.cancelled.value = 'true';
	$( "#makeDonation" ).popup( "close" );	
}

function makeDonation(memberId, charityId, amount, confidential, reminderSchedule, blankEnv, currencyEnv) {
	//alert('donationLog makeDonation popupafterclose memberId ' + memberId + " charityId " + charityId + " amount " + amount + " confidential? " + confidential + " reminderSchedule? " + reminderSchedule + " blankEnvelope? " + blankEnv + " currencyInEnvelope? " + currencyEnv);
		doAmountTransaction(0, charityId, memberId, 0, amount);
		// tjs 130109
		postRatingsUpdate(charityId, memberId, blankEnv, currencyEnv, confidential, reminderSchedule);
}

function cancelSolicitation() {
	//alert("donationLog cancelSolicitation...");
	document.solicitationLogForm.cancelled.value = 'true';
	$( "#logSolicitation" ).popup( "close" );	
	//alert("donationLog cancelSolicitation closed panel...");
}

// tjs 130107
function logSolicitation(memberId, charityId, blankEnv, currencyEnv) {
	//alert('donationLog logSolicitation memberId ' + memberId + " charityId " + charityId + " blankEnv " + blankEnv + " currencyEnv " + currencyEnv);
	doAmountTransaction(0, charityId, memberId, 0, 0);
	// tjs 130109
	postRatingsUpdate(charityId, memberId, blankEnv, currencyEnv, false, false);
}

function processDonationForm() {
//doAmountTransaction(trxType, charityId, memberId, id, newAmount)
	//alert("charity processDonationForm...");
	//var id = document.donationForm.id.value;
	var charityId = document.donationForm.charityId.value;
	var memberId = document.donationForm.memberId.value;
	var amount = document.donationForm.amount.value;
	doAmountTransaction(0, charityId, memberId, 0, amount);

	//$("#donationDialog").dialog("close");
	//$('.ui-dialog').dialog('close');
	// tjs 130102
	//hijaxCharitiesPage();
	hijaxAllCharitiesPage();
}

function processLoginForm() {
	//alert("donationLog processLoginForm...");
	var name = document.loginForm.name.value;
	var password = document.loginForm.pword.value;
	//alert("donationLog processLoginForm name " + name + " password " + password);

	// tjs 120311
	var doLoginCompleted = false;
	
	var loginRequest = getXMLHTTPRequest();
	// e.g. http://localhost/~thomassoucy/donationLog/login.php?username=SteelDrum&password=tom123
	var url = 'login.php?username=' + name + '&password=' + password;
	//alert("donationLog processLoginForm url " + url);
	//tjs101123
	//requestXMLData(charityRequest, url, function() {
	postRequestXMLData(loginRequest, url, function() {
	   if(loginRequest.readyState == 4) {
		// if server HTTP response is "OK"
		//alert("donationLog processLoginForm readyState 4 loginRequest.status " + loginRequest.status);
			if(loginRequest.status == 200) {
		    	var data = loginRequest.responseXML;
				$(data).find('member').each(function() {
					var member = $(this);
					//html += '<tr>';
					//var memberId = member.attr('id');
					loginAccountNumber = member.attr('id');
					//alert("donationLog processLoginForm memberId " + memberId);
					//alert("donationLog processLoginForm memberId " + loginAccountNumber);

//tjs 110209
					db.transaction( // remove from client side rows that don't belong
						function(transaction) {
							transaction.executeSql(
							   'DELETE FROM charities WHERE memberId != ?;',
								[loginAccountNumber],
								function (transaction, result) {
								},
								errorHandler
							); //end client side removal
						} //end client side removal trx function
					); //end client side removal trx
					//tjs 101223
					var id = 0;
					var maxId = 0;
					var minId = 0;
					//var charities = new Array();
					//var charity;
					db.transaction(
						function(transaction) {
							transaction.executeSql(
							   'SELECT * FROM charities WHERE id > ?;',
								[minId],
								function (transaction, result) {
									//alert("processLoginForm result.rows.length " + result.rows.length);
									for (var i=0; i < result.rows.length; i++) {
										var row = result.rows.item(i);
										id = row.id;
										charity = new Charity(id, null, null, null, null, null, null, null, null, null);
										// e.g. 0 536 0 thru 400 936 935
										//if (i % 100 == 0) {
										//	alert("findMaxCharityId i " + i + " id " + id + " charityId " + charity.id);
										//}
										//if (i % 100 == 0) {
										//	alert("findMaxCharityId i " + i + " id " + id + " charityId " + charity.id);
										//}
				
										if (id > maxId)
											maxId = id;
									}
									// next refresh client side charities
									//e.g. 1026
									//alert("processLoginForm maxId " + maxId);
									
									// next refresh client side charities table knowing the prior maxId...
									var detail = true;
									var charityRequest = getXMLHTTPRequest();
									//var url = 'getCharitiesXML.php?account=' + loginAccountNumber;
									var url = 'getCharitiesXML.php?account=' + loginAccountNumber + '&maxId=' + maxId;
									//alert("charity refreshCharities url " + url);
									//tjs101123
									//requestXMLData(charityRequest, url, function() {
									postRequestXMLData(charityRequest, url, function() {
									   if(charityRequest.readyState == 4) {
										// if server HTTP response is "OK"
										//alert("charity refreshCharities readyState 4 charityRequest.status " + charityRequest.status);
										if(charityRequest.status == 200) {
											//if (detail) {
											var data = charityRequest.responseXML;
											//var html = '<table id="charityTable"><thead><tr><th>ID</th><th>Charity Name</th><th>Short Name</th><th>Solicitations</th><th>Donations</th><th>Average</th><th>Amount</th><th>Action(<input type="image" onclick="addCharity()" src="images/icon_plus.gif"';
											var charities = new Array();
											//var sql;
											var charity;
											//var html;
											$(data).find('charity').each(function() {
												var $charity = $(this);
												//html += '<tr>';
												var charityId = $charity.attr('id');
												var solicitations = $charity.attr('solicitations');
												var donations = $charity.attr('donations');
												var average = $charity.attr('average');
												//html += '<td>' + charityId + '</td>';
												var children = $charity.children();
												var name = children[0].firstChild.nodeValue;
												//html += '<td>' + name+ '</td>';
												var shortName = ' ';
												if (children[1].firstChild) {
													shortName = children[1].firstChild.nodeValue;
												}
												//html += '<td>' + shortName + '</td>';
												if (detail) {
													var dunns = ' ';
													if (children[2].firstChild) {
														dunns = children[2].firstChild.nodeValue;
													}
													//var url = ' ';
													var url = '';
													if (children[3].firstChild) {
														url = children[3].firstChild.nodeValue;
														url = removeSpaces(url);
														//html += '<td><a href="http://' + url + '" >' + name + '</a></td>';
													} else {
														//html += '<td>' + name+ '</td>';
													}
													//html += '<td>' + shortName + '</td>';
													var description = ' ';
													if (children[4].firstChild) {
														description = children[4].firstChild.nodeValue;
													}
													var numStars = ' ';
													if (children[5].firstChild) {
														numStars = children[5].firstChild.nodeValue;
													}
													var rating = Number(numStars);
													if (rating == 0 && solicitations > 0 && donations > 0) {
														var ratio = donations/solicitations;
														//alert("charity refreshCharities numStars " + numStars + " rating " + rating + " solicitations " + solicitations + " donations " + donations);
														if (ratio > .9) {
															rating = -5;
														} else if (ratio > .8) {
															rating = -4;
														} else if (ratio > .6) {
															rating = -3;
														} else if (ratio > .4) {
															rating = -2;
														} else {
															rating = -1;
														}
													}
													var date = new Date();
													var isInactive = null;
													//Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive)
													charity = new Charity(charityId, loginAccountNumber, name, shortName, dunns, url, description, numStars, date, isInactive);
													charities.push(charity);
												} else {				
													var dunns = ' ';
													var url = '';
													var description = ' ';
													var numStars = ' ';
													var date = new Date();
													var isInactive = null;
													//Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive)
													charity = new Charity(charityId, loginAccountNumber, name, shortName, dunns, url, description, numStars, date, isInactive);
													charities.push(charity);
												}
												//html += '</tr>';
											});
											//html += '</tbody></table>';
											//alert("charity refreshCharities html " + html);
											var count = charities.length;
											//alert("charity processLoginForm number of newly added charities " + count);
											//the charities array contains newly added charities
											if (count > 0) {
												//add them to the client side database...
												//Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive)
												db.transaction(
													function(transaction) {
														for (i=0; i < charities.length; i++) {
															charity = charities[i];
															transaction.executeSql(
																'INSERT INTO charities (id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
																[charity.id, charity.memberId, charity.charityName, charity.shortName, charity.dunns, charity.url, charity.description, charity.numStars, charity.createdDate, charity.isInactive],
																function(){
																	//refreshEntries();
																	//jQT.goBack();
																},
																errorHandler
															);
														}
														// tjs 120311
														charitiesHtml.length = 0;
														// tjs 130109
														//sectionLetters.length = 0;
														//sectionRanges.length = 0;
														//loadCharities(); 
														setTimeout(function() {
															finalizeLogin();
															},3000);
													}
												);
											} else {
												//alert("charity processLoginForm no new insertions...");
												// tjs 120311
												doLoginCompleted = true;
											}
								
											//todo request inactives from server and update the client side RDB with them
											//tjs101230
											//tjs 111215
											//$('#login').removeClass('showButton').addClass('hideButton');
											//$('#logout').removeClass('hideButton').addClass('showButton');
											authenticated = true;
								
											 //$("#loginDialog").dialog("close");
											 //doBack();
								
								//tjs 111215
			//$('#loginButton').removeClass('showDiv').addClass('hideDiv');
			//$('#logoutButton').removeClass('hideDiv').addClass('showDiv');
											// tjs 120311
											if (doLoginCompleted) {
												finalizeLogin();
											}
			//tjs 111216
											//var buttonHtml = '<input type="button" value="Logout" onclick="javascript:logout();" data-icon="arrow-l" class="ui-btn-right"/>';
			//$('#loginLogoutButton').empty();
			//$('#loginLogoutButton').append($(buttonHtml));
											//$('.ui-dialog').dialog('close');

											// tjs 111220
											//$.mobile.loadPage( '#charities-page', { showLoadMsg: false } );
											
										 //isDone = true;
										// i.e. means no response status 200
										} else {
											// issue an error message for any other HTTP response
											alert("An error has occurred: " + charityRequest.statusText);
										}
										// i.e. no ready state so waiting...
										} else { // else waiting...
											var html = '<p>Waiting...</p>';
											if (detail == true) {
												//$('#charityDetailList').append($(html));
											} else {
												//$('#charityList').append($(html));
											}
										}
									});										
								},
								errorHandler
							);
						}
					);
				});
			}
		}
	});
}

// tjs 120311
function finalizeLogin() {
	var buttonHtml = '<input type="button" value="Logout" onclick="javascript:logout();" data-icon="arrow-l" class="ui-btn-right"/>';
	$('#loginLogoutButton').empty();
	$('#loginLogoutButton').append($(buttonHtml));
	// tjs 130103
	// convert to popup
	//$('.ui-dialog').dialog('close');
	$( "#login-dial" ).popup( "close" );
	$.mobile.loadPage( '#home-page', { showLoadMsg: false } );
}

function handleLogout() {
	var logoutRequest = getXMLHTTPRequest();
	// e.g. http://localhost/~thomassoucy/donationLog/login.php?username=SteelDrum&password=tom123
	var url = 'logout.php';
	//alert("charity refreshCharities url " + url);
	//tjs101123
	//requestXMLData(charityRequest, url, function() {
	requestXMLData(logoutRequest, url, function() {
	   if(logoutRequest.readyState == 4) {
		// if server HTTP response is "OK"
		//alert("donationLog processLoginForm readyState 4 loginRequest.status " + loginRequest.status);
			if(logoutRequest.status == 200) {
		    	//var data = logoutRequest.responseXML;
				alert("donationLog handleLogout");
			}
		}
	});
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

/*
CREATE TABLE IF NOT EXISTS `charities` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `memberId` smallint(5) unsigned NOT NULL,
  `charityName` varchar(128) NOT NULL,
  `shortName` varchar(15) DEFAULT NULL,
  `dunns` varchar(15) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `numStars` mediumint(9) NOT NULL,
  `createdDate` date NOT NULL,
  `isInactive` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `charityForMember` (`id`, `memberId`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

*/

 function Charity(id, memberId, charityName, shortName, dunns, url, description, numStars, createdDate, isInactive) {
	this.id = id;
	this.memberId = memberId;
	this.charityName = charityName;
	this.shortName = shortName;
	this.dunns = dunns;
	this.url = url;
	this.description = description;
	this.numStars = numStars;
	this.createdDate = createdDate;
	this.isInactive = isInactive;
}

function sortCharityById(a,b) {
    var idDiff = a.id - b.id;
    if (idDiff != 0) {
        return idDiff;
    }
    return 0;
}

function handleCharitySelect(torf, charityId, memberId, amount) {
	//alert("donationLog handleCharitySelect torf " + torf + " charityId " + charityId + " memberId " + memberId + " amount " + amount);
	
	var target = $('#' + charityId)[0];
	if (target != null) {
		//alert("donationLog handleCharitySelect target...");
		//var href = target.href;
		//alert("donationLog handleCharitySelect target href " + href);
		//var children = target.childNodes.length;
		//alert("donationLog handleCharitySelect target children " + children);
		var elm = target.firstChild;
		//var href = elm.href;
		//alert("donationLog handleCharitySelect elm href " + href);
		//var style = target.style;
		var style = elm.style;
		//if (style) {
		if (style != null) {
			//alert("donationLog handleCharitySelect style...");
			var color = style.color;
			if (color != null) {
				//alert("donationLog handleCharitySelect color " + color);
				if (color == 'red') {
					style.color = "";
					//alert("donationLog handleCharitySelect reset color...");
					addSolicitation(memberId, charityId, 0);
					return;
				} else {
					addDonation(memberId, charityId, amount);
				}
			}
		}
	}
	
	//todo dialog box to confirm the log of the solicitation or donation
	//addDonation(memberId, charityId, amount);
	//doAmountTransaction(0, charityId, memberId ,0 ,0);						
}

function hideAds() {
	//setTimeout(hide, 5000);
	//tjs 110104 for demo only increase time....
	setTimeout(hide, 8000);
}

function hide() {
	var ads = document.querySelector(".ads");
	ads.style.marginTop = (-ads.offsetHeight) + "px";
}

function reveal() {
	var ads = document.querySelector(".ads");
	ads.style.marginTop = "";
	hideAds();
}
/*
// tjs 111223
function hijaxCharitiesPage() {
	if (loginAccountNumber == 0)
		return;
	var newPageHtml = '<div data-role="page" id="charities-page" data-title="Charities" data-theme="b" data-dom-cache="true">';
		newPageHtml += '<div data-role="header"><a href="#home-page" data-icon="arrow-l">Back</a><h1>Charities</h1></div>';
		newPageHtml += '<div data-role="content">';
		//newPageHtml += loadCharities();
		newPageHtml += charitiesHtml;
		newPageHtml += '</div></div>';
		
		//alert("hijaxCharitiesPage newPageHtml " + newPageHtml);
		
		var newPage = $(newPageHtml);
		//add new page to page container
		newPage.appendTo($.mobile.pageContainer);
		
		// tweak the new page just added into the dom (if needed)
	    
	// enhance and open the new page
	    $.mobile.changePage(newPage);
}
model:
        <div class="content-secondary"> 
            This would be the sidebar/split view on a tablet, 
            would show up stacked on a mobile device
        </div><!-- end content-secondary -->    

        <div class="content-primary"> 
            This is the main content. 

            If Tablet device this would be to the right of the above content, 
            if mobile this would be below the above content.

        </div><!-- end content-primary -->

*/

// tjs 120309
function hijaxCharitiesPage(sectionNumber) {
	//alert("donationLog hijaxCharitiesPage sectionNumber " + sectionNumber);
	//debug comment out:
	if (loginAccountNumber == 0)
		return;
	if (sectionNumber == null) {
		sectionNumber = currentSectionNumber;
	} else {
		currentSectionNumber = sectionNumber;
	}
	// tjs 130102
	if (sectionRanges.length == 0) {
		loadCharities();
	}
	/*
	 * retrofit:
	 donationHtml = '<ul data-role="listview" id="' + startLetter + 'L" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';

	 buttonsHtml = '<li id="' + startLetter + 'D" data-role="list-divider"><div  class="segmented-control ui-bar-d"><div data-role="controlgroup" data-type="horizontal">';
	 buttonsHtml += '<a href="#' + sectionLetters[n] + 'D" data-role="button" class="ui-control-active" rel="external">' + sectionLetters[n] + '</a>';
	donationHtml += buttonsHtml + '</div></div></li>';
	 */
	var newPageHtml = '<div data-role="page" id="charities-page" data-title="Charities" data-theme="b" data-dom-cache="true">';
		newPageHtml += '<div data-role="header"><a href="#home-page" data-icon="arrow-l">Back</a><h1>Charities</h1></div>';
		newPageHtml += '<div data-role="content">';
		//newPageHtml += '<div class="content-secondary">';
		//newPageHtml += '<ul data-role="listview">';
		// tjs 130102 eliminate the sections...
		/*
		// tjs 130101
		newPageHtml += '<ul data-role="listview">';
		//newPageHtml += '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
		//newPageHtml += '<ul data-role="listview" data-autodividers="true" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
		var  buttonsHtml = '<li data-role="list-divider"><div class="segmented-control ui-bar-d"><div data-role="controlgroup" data-type="horizontal">';
		//var  buttonsHtml = '<li data-role="list-divider"><div data-role="controlgroup" data-type="horizontal">';
		for (var i = 0; i < sectionRanges.length; i++) {
			//newPageHtml += '<li><a onclick="javascript:hijaxCharitiesPage(' + i + ')" data-role="button" style="padding:2px; font-size:x-small;"';
			 //buttonsHtml += '<a onclick="javascript:hijaxCharitiesPage(' + i + ') data-role="button"';
			 buttonsHtml += '<a href="javascript:hijaxCharitiesPage(' + i + ')" data-role="button" style="font-size:x-small;"';
			if (i == sectionNumber) {
				//newPageHtml += ' data-theme="c" ';
				buttonsHtml += ' class="ui-control-active"';
				//rel="external">' + sectionLetters[n] + '</a>';
			}
			//newPageHtml += '>' + sectionRanges[i] + '</a></li>';
			//buttonsHtml += ' rel="external">' + sectionRanges[i] + '</a>';
			buttonsHtml += ' rel="external">' + sectionRanges[i] + '</a>';
		}
		// tjs 130101
		buttonsHtml += '</div></div></li></ul>';
		//buttonsHtml += '</div></div></li>';
		newPageHtml += buttonsHtml;
		*/
		// tjs 130102 combine all sections...
		//newPageHtml += '<ul data-role="listview" data-autodividers="true" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
		//newPageHtml += '<ul data-role="listview" data-autodividers="true" data-filter="true" data-filter-placeholder="Search..." data-split-icon="arrow-r" data-split-theme="d">';
		newPageHtml += '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-split-theme="d" data-split-icon="arrow-r">';
		for (var i = 0; i < sectionRanges.length; i++) {
			newPageHtml += charitiesHtml[i];
		}		
		// tjs 130101
		//newPageHtml += '<ul data-role="listview" data-split-icon="refresh" data-split-theme="d">';
		//newPageHtml += '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
		//newPageHtml += '<ul data-role="listview" data-autodividers="true" data-filter="true" data-filter-placeholder="Search..." data-split-icon="refresh" data-split-theme="d">';
		//newPageHtml += charitiesHtml[sectionNumber];
		// tjs 120309 for perf:
		newPageHtml += '</ul>';
		newPageHtml += '</div><!-- content -->';
		newPageHtml += '</div><!-- /page -->';
		
		//alert("hijaxCharitiesPage newPageHtml " + newPageHtml);
		
		var newPage = $(newPageHtml);
		//add new page to page container
		newPage.appendTo($.mobile.pageContainer);
		
		// tweak the new page just added into the dom (if needed)
        //$('.content-secondary').css({'float':'left','width':'15%'});
        //$('.content-primary').css({'margin-left':'18%'});

	// enhance and open the new page
	    $.mobile.changePage(newPage);
}

function hijaxAllCharitiesPage() {
	//alert("donationLog hijaxAllCharitiesPage...");
	//debug comment out:
	// tjs 130104 temp disable
	//if (loginAccountNumber == 0)
	//	return;
	//alert("donationLog hijaxAllCharitiesPage loading...");
	loadAllCharities();
	//alert("donationLog hijaxAllCharitiesPage loaded...");
}

//tjs 130109
function postRatingsUpdate(charityId, memberId, blank, currency, reminder, confidential) {

	//alert('donationLog postRatingsUpdate memberId ' + memberId + " charityId " + charityId + " blank " + blank + " currency " + currency);

	if (!blank && !currency && !reminder && !confidential)
		return;

	var dt = new Date();
	var my_year=dt.getFullYear();

	//alert('donationLog postRatingsUpdate memberId ' + memberId + " charityId " + charityId + " year " + my_year + " blank " + blank + " currency " + currency + " reminder " + reminder + " confidential " + confidential);

	var ratingsRequest = getXMLHTTPRequest();
	var url = '../charityhound/ratings.php?account=' + memberId + '&charityId=' + charityId + '&date=' + my_year + '&blank=' + blank + '&currency=' + currency + '&reminder=' + reminder + '&confidential=' + confidential;
	//alert ("charity postRatingsUpdate url " + url);
	// NB account = 0 means it derives using the session on server
// e.g. charity postRatingsUpdate url ratings.php?account=0&charityId=545&date=2012-03-16&blank=true&currency=false&reminder=false&confidential=false
	requestXMLData(ratingsRequest, url, function() {
		   if(ratingsRequest.readyState == 4) {
				if(ratingsRequest.status == 200) {
				    //var data = ratingsRequest;
					//alert ("charity postRatingsUpdate ratings posted!");
				} else {
				    // issue an error message for any other HTTP response
				    alert("An error has occurred: " + ratingsRequest.statusText);
				}
		   }
	});
}
