/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

/**
 * pic.js
 * allows to select (or take) a picture
 */

//variables
var showLogs = true;

//upload img & preview
//http://codepedia.info/html5-filereader-preview-image-show-thumbnail-image-before-uploading-on-server-in-jquery/


$(document).ready(function () {
    if(showLogs) console.log("document ready");
    
    var img2send = null;
    var maxSize = 1024 * 1024 * 5; //5 MByte
    
    //gui elements
    var prevLink = $("#prev_link");
    var prevImg = $("#prev_img");
    var chooseImg =  $("#chooseImg");
    var fileInput = $("#fileInput");
    var prevName = $("#prev_name");
    
    $("#p_fileTooBig").text($("#p_fileTooBig").text().replace("_SIZE", (maxSize/1024)));
    
    //shows the dialog to choose a file
    $("#fileInputTrigger").on('click', function () {
        if(showLogs) console.log("file input dialog triggered");
        fileInput.click();
    });
    
    $("#fileInput").on('change', function () {
        if (showLogs) console.log('fileInput change');
        
        var file = this.files[0];
        var name = file.name;
        var fileType = file["type"];
        
        var size = file.size;

        if(validFileType(fileType)){
            // invalid file type code goes here.
            if(showLogs) console.log("no image selected");
            
            $("#ErrorInvalidFileTypeDialog").show();
        }else{
            //valid file type
            if(showLogs) console.log("image selected");
            
            if(validSize(size)){
                if (typeof (FileReader) != "undefined") {
                //to make sure nothing interferes
                resetImgPrev();

                var reader = new FileReader();

                reader.onload = function (e) {
                    var prevLink = $("#prev_link");
                    var prevImg = $("#prev_img");
                    
                    //set preview image and name
                    prevImg.attr("src", e.target.result);
                    prevLink.attr("href", e.target.result);
                    prevName.text(name);
                    
                    showPreview();
                    
                    img2send = e.target.result;
                };
                
                reader.readAsDataURL(file);
                
                }else {
                    $("#ErrorCantChooseFileDialog").show();
                }
            }else{
                $("#ErrorFileTooBigDialog").show();
            }
        }
        
    });
    
    $(".prev_error_ok").on('click', function(e){
        hideErrorDialog();
    });
    
    $("#a_prev_cancel").on('click', function () {
        if (showLogs) console.log("img_prev_cancel click");
        closeImgPrev();
    });

    $("#img_prev_close").on('click', function () {
        if (showLogs) console.log("img_prev_close click");
        closeImgPrev();
    });
    
    $("#a_prev_send").on("click", function() {
        if (showLogs) console.log("img_prev_send click");
        sendImage(img2send);
        resetImgPrev();
    });
    
    function hideErrorDialog(){
        $("#ErrorCantChooseFileDialog").hide();
        $("#ErrorFileTooBigDialog").hide();
        $("#ErrorInvalidFileTypeDialog").hide();
    }
    
    function showPreview(){
        chooseImg.show(500);
    }
    
    function closeImgPrev(){
        resetImgPrev();
    }
    /**
     * resets the image preview (hides elements)
     */
    function resetImgPrev(){
        fileInput.replaceWith( fileInput = fileInput.clone( true ) );
        prevImg.attr("src", "");
        prevLink.attr("href", "#");
        prevName.text("");
        chooseImg.hide();
    }
    /**
     * checks that the file type is one of the allowed types
     * @param {type} type type of the file
     * @returns {Boolean} true if the file type is allowed
     */
    function validFileType(type){
        var validImageTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];        
        return ($.inArray(type, validImageTypes) < 0);
    }
    /**
     * checks if the file size is not bigger than the max. allowed size
     * @param {number} size  of the file
     * @returns {Boolean} true if actual size is smaller or equal to max. allowed size
     */
    function validSize(size){
        return size <= maxSize;
    }
    
});
