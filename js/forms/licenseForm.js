/*
**************************************************************************************************************************
** CORAL Management Module v. 1.0
**
** Copyright (c) 2010 University of Notre Dame
**
** This file is part of CORAL.
**
** CORAL is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
**
** CORAL is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License along with CORAL.  If not, see <http://www.gnu.org/licenses/>.
**
**************************************************************************************************************************
*/


$(function(){

	$(".sectiontoggle").click(function(e) {
		e.preventDefault();
		$($(this).attr("href")).fadeIn("fast");
	});

	//check this name to make sure it isn't already being used
	$("#licenseShortName").keyup(function() {
		  $.ajax({
			 type:       "GET",
			 url:        "ajax_processing.php",
			 cache:      false,
			 async:	     true,
			 data:       "action=getExistingLicenseName&shortName=" + $("#licenseShortName").val(),
			 success:    function(exists) {
				if ((exists == "0") || (exists == $("#editLicenseID").val())){
					$("#span_error_licenseShortName").html("&nbsp;");
					$("#submitLicense").removeAttr("disabled");
				}else{
				  $("#span_error_licenseShortName").html("This name is already being used!");
				  $("#submitLicense").attr("disabled","disabled");

				}
			 }
		  });


	});	


	//check this name to make sure it isn't already being used
	//in case user doesn't use the Autofill and the organization already exists
	$("#organizationName").keyup(function() {
		  $.ajax({
			 type:       "GET",
			 url:        "ajax_processing.php",
			 cache:      false,
			 async:	     true,
			 data:       "action=getExistingOrganizationName&shortName=" + $("#organizationName").val(),
			 success:    function(exists) {
				if (exists == "0"){
					$("#licenseOrganizationID").val("");
					$("#span_error_organizationNameResult").html("<br />Warning!  This organization will be added new.");

				}else{
					$("#licenseOrganizationID").val(exists);
					$("#span_error_organizationNameResult").html("");

				}
			 }
		  });


	});	



	//used for autocomplete formatting
         formatItem = function (row){ 
             return "<span style='font-size: 80%;'>" + row[1] + "</span>";
         }
	 
         formatResult = function (row){ 
             return row[1].replace(/(<.+?>)/gi, '');
         }	

	$("#organizationName").autocomplete('ajax_processing.php?action=getOrganizations', {
		minChars: 2,
		max: 50,
		autoFill: true,
		mustMatch: false,
		width: 233,
		delay: 20,
		cacheLength: 10,
		matchSubset: true,
		matchContains: true,	
		formatItem: formatItem,
		formatResult: formatResult,
		parse: function(data){
		    var parsed = [];
		    var rows = data.split("\n");
		    for (var i=0; i < rows.length; i++) {
		      var row = $.trim(rows[i]);
		      if (row) {
			row = row.split("|");
			parsed[parsed.length] = {
			  data: row,
			  value: row[0],
			  result: formatResult(row, row[0]) || row[0]
			};
		      }
		    }

		    if (parsed.length == 0) {

			  $.ajax({
				 type:       "GET",
				 url:        "ajax_processing.php",
				 cache:      false,
				 async:	     true,
				 data:       "action=getExistingOrganizationName&shortName=" + $("#organizationName").val(),
				 success:    function(exists) {
					if (exists == "0"){
					        $("#licenseOrganizationID").val("");
					        $("#span_error_organizationNameResult").html("<br />Warning!  This organization will be added new.");

					}else{
						$("#licenseOrganizationID").val(exists);
						$("#span_error_organizationNameResult").html("");

					}
				 }
			  });
		    
		    }
		}		
	 });
 
	 
	//once something has been selected, change the hidden input value
	$("#organizationName").result(function(event, data, formatted) {
		if (data[0]){
			$("#licenseOrganizationID").val(data[0]);
			$("#span_error_organizationNameResult").html("");
		}
	});


});

 //attach enter key event to new input and call add data when hit
 $('#licenseConsortiumID').keyup(function(e) {
		 if(e.keyCode == 13) {
			   doSubmitLicense();
		 }
 });

 //attach enter key event to new input and call add data when hit
 $('#documentTypeID').keyup(function(e) {
		 if(e.keyCode == 13) {
			   doSubmitLicense();
		 }
 });

$("#submitLicense").click(function () {
//	alert("DocumentType: " + $("#docTypeID").val());	
//	alert("Category: " + $("#licenseConsortiumID").val());
  	doSubmitLicense();

});


function doSubmitLicense(){
  if (validateForm() === true) {
	// ajax call to add/update
	
//	alert("DocumentType2:" + $("#docTypeID").val());
	
	if ($("#docTypeID").val()) {
		if ($("#archiveInd").is(":checked")) {
			archiveval = 1;
		} else {
			archiveval = 0;
		}
		$.post("ajax_processing.php?action=submitLicense", { licenseID: $("#editLicenseID").val(),description: $("#licenseDescription").val(),shortName: $("#licenseShortName").val(), organizationID: $("#licenseOrganizationID").val(), organizationName: $("#organizationName").val(), consortiumID: $("#licenseConsortiumID").val(), documentTypeID: $("#docTypeID").val(), uploadDocument: fileName, archiveInd: archiveval, "note":{"body": $("#noteBody").val(),"documentNoteTypeID": $("#noteDocumentNoteTypeID").val(),"documentID": $("#noteDocumentID").val()},revisionDate: $("#revisionDate").val() } ,
			function(data){$("#div_licenseForm").html(data);});
	} else {
		alert("No DocumentTypeID");
	}
	return false;
  
  }
}

//the following are only used when interoperability with organizations module is turned off
function newConsortium(){
  $('#span_newConsortium').html("<input type='text' name='newConsortium' id='newConsortium' class='licenseAddInput' />  <a href='javascript:addConsortium();'>add</a>");

	 //attach enter key event to new input and call add data when hit
	 $('#span_newConsortium').keyup(function(e) {

			 if(e.keyCode == 13) {
				   addConsortium();
			 }
	 });
}

function addConsortium(){
  //check for duplicates
  $.ajax({
	 type:       "POST",
	 url:        "ajax_processing.php?action=checkForDuplicates",
	 cache:      false,
	 data:       { shortName: $("#newConsortium").val(), newType: "Consortium" },
	 success:    function(data) {
					if (data == "1") {
					  //add consortium to db and returns updated select box
					  $.ajax({
						 type:       "GET",
						 url:        "ajax_processing.php",
						 cache:      false,
						 data:       "action=addConsortium&shortName=" + $("#newConsortium").val()+"&editLicenseID="+$("#editLicenseID").val(),
						 success:    function(html) { $('#span_consortium').html(html); $('#span_newConsortium').html("<font color='red'>Category has been added</font>"); }
					 });
					} else {
						alert("That Category is already in use.");
					}
	 			}
 	});
}


//the following are only used when interoperability with organizations module is turned off
function newDocumentType(){
  $('#span_newDocumentType').html("<input type='text' name='newDocumentType' id='newDocumentType' class='licenseAddInput' />  <a href='javascript:addDocumentType();'>add</a>");

	 //attach enter key event to new input and call add data when hit
	 $('#span_newDocumentType').keyup(function(e) {

			 if(e.keyCode == 13) {
				   addDocumentType();
			 }
	 });
}

function addDocumentType(){
  //check for duplicates
  $.ajax({
	 type:       "POST",
	 url:        "ajax_processing.php?action=checkForDuplicates",
	 cache:      false,
	 data:       { shortName: $("#newDocumentType").val(), newType: "DocumentType" },
	 success:    function(data) {
					if (data == "1") {
					  //add documentType to db and returns updated select box
					  $.ajax({
						 type:       "POST",
						 url:        "ajax_processing.php?action=addDocumentType",
						 cache:      false,
						 data:       { shortName: $("#newDocumentType").val() },
						 success:    function(html) { $('#span_documentType').html(html); $('#span_newDocumentType').html("<font color='red'>DocumentType has been added</font>"); }
					  });
					} else {
						alert("That type is already in use.");
					}
				 }
 });
}

function newNoteType(){
  $('#span_newNoteType').html("<input type='text' name='newNoteType' id='newNoteType' class='licenseAddInput' />  <a href='javascript:addNoteType();'>add</a>");

	 //attach enter key event to new input and call add data when hit
	 $('#span_newNoteType').keyup(function(e) {

			 if(e.keyCode == 13) {
				   addDocumentType();
			 }
	 });
}

function addNoteType(){
  //check for duplicates
  $.ajax({
	 type:       "POST",
	 url:        "ajax_processing.php?action=checkForDuplicates",
	 cache:      false,
	 data:       { shortName: $("#newNoteType").val(), newType: "DocumentNoteType" },
	 success:    function(data) {
					if (data == "1") {
					  $.ajax({
						 type:       "GET",
						 url:        "ajax_processing.php",
						 cache:      false,
						 data:       "action=addNoteType&shortName=" + $("#newNoteType").val(),
						 success:    function(html) { $('#span_noteType').html(html); $('#span_newNoteType').html("<font color='red'>Note Type has been added</font>"); }
						});
					} else {
						alert("That Note Type is already in use.");
					}
	 			}
 	});
}


function newNoteType(){
  $('#span_newNoteType').html("<input type='text' name='newNoteType' id='newNoteType' class='licenseAddInput' />  <a href='javascript:addNoteType();'>add</a>");

	 //attach enter key event to new input and call add data when hit
	 $('#span_newNoteType').keyup(function(e) {

			 if(e.keyCode == 13) {
				   addDocumentType();
			 }
	 });
}


//validates fields
function validateForm (){
	myReturn=0;
	
	if (!validateRequired('licenseShortName','License Name is required.')) myReturn="1";
	if (!validateRequired('licenseConsortiumID','A Category is required.')) myReturn="1";	
//	if (!validateRequired('organizationName','Provider is required.')) myReturn="1";

		if ($("#headerText").text().indexOf("Edit") == -1) {
			if ($("#div_file_message").text().indexOf("successfully uploaded") > 0) {
				$("#span_error_licenseuploadDocument").html('');
			} else {
				$("#span_error_licenseuploadDocument").html('File is required');
				$("#licenseuploadDocument").focus();				
				myReturn="1";
			}
		}
	
	if (myReturn == "1"){
		return false;
	}else{
		return true;
	}
}

var fileName = $("#upload_button").val();
var exists = '';

//verify filename isn't already used
function checkUploadDocument (file, extension){
	$("#div_file_message").html("");
	 $.ajax({
		 type:       "POST",
		 url:        "ajax_processing.php?action=checkUploadDocument",
		 cache:      false,
		 async:      false,
		 data:       { uploadDocument: file },
		 success:    function(response) {
			if (response == "1"){
				exists = "1";
				$("#div_file_message").html("  <font color='red'>File name is already being used...</font>");
				return false;
			}else if (response == "2"){
				exists = "2";
				$("#div_file_message").html("  <font color='red'>File name may not contain special characters - ampersand, single quote, double quote or less than/greater than characters</font>");
				return false;	
			} else if (response == "3"){
				exists = "3";
				$("#div_file_message").html("  <font color='red'>The documents directory is not writable.</font>");
				return false;	
			}else{
				exists = "";
			}
		 }


	});
}

//do actual upload
new AjaxUpload('upload_button',
	{action: 'ajax_processing.php?action=uploadDocument',
			name: 'myfile',
			onChange : function (file, extension){checkUploadDocument(file, extension);},
			onComplete : function(data,response){
				fileName=data;

				if (exists == ""){
				  var errorMessage = $(response).filter('#error');
          if (errorMessage.size() > 0) {
            $("#div_file_message").html("<font color='red'>" + errorMessage.html() + "</font>");
          } else {
  					$("#div_file_message").html("<img src='images/paperclip.gif'>" + fileName + " successfully uploaded."); 
					$("#span_error_licenseuploadDocument").html('');
  					$("#div_uploadFile").html("<br />");
          }
				}

		}
});
