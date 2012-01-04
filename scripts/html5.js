/***************************************
$Revision:: 33                         $: Revision of last commit
$LastChangedBy::                       $: Author of last commit
$LastChangedDate:: 2011-02-04 13:30:00#$: Date of last commit
***************************************/
/* 
Collaborators/js/
html5.js

tjs 101026

file version 1.00 

release version 1.12

*/
// support for IE less than version 9
  var e = ("abbr,article,aside,audio,canvas,datalist,details," +
  "figure,footer,header,hgroup,mark,menu,meter,nav,output," +
  "progress,section,time,video").split(",");
  for (var i = 0; i < e.length; i++) {
  documents.createElement(e[i]);
