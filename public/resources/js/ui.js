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
 * ui.js
 * contains functions dealing with ui elements
 * used by guides and tourists
 */

//variables

//div containing the chat
var chatBox;
var chat;
//chat elements
var headingPanel;
var primaryPanel;
var isTypingSpan;

var chatIsMinimised=false;
var hangUp;
var hangUpCollapse;

var smallChatColors = {
    no_message: "#2585C4",
    new_message: "#28B294"
};
//div contining the map size: 100%
var mapDiv;
//black div that will contain the video dom element
var videoDiv;
//audio and video contols (buttons) that are shown or hidden depending of if the feauture is supported
var videoControlsDiv;
var audioControlsDiv;
var videoControlsNavBarButton;
var myAvatarIcon;
var peerAvatarIcon;

var spinner;

/**
 * initialises ui variables
 * !needs to be called in document.ready()!
 */
function initUI(isGuide){
    if (showLogs) console.log('init gui');
    chat = $("#chat");
    headingPanel = $("#headingPanel");
    primaryPanel = $("#primaryPanel");
    chatBox = $("#chatBox");
    isTypingSpan = $("#spn_isTyping");
    mapDiv = $("#hammerContainer");
    videoDiv=$("#hammerVideo");
    videoControlsDiv = $("#ico_video");
    audioControlsDiv = $("#ico_audio");
    spinner = $('.spinnerChat');
    hangUp = $('#hangUp');
    hangUpCollapse = $('#hangUpCollapse');
    videoControlsNavBarButton = $('#controlsBtn');

    if(isGuide){
        myAvatarIcon = "resources/images/guide.png";
        peerAvatarIcon = "resources/images/tourist.png";
    }
    else{
        myAvatarIcon = "resources/images/tourist.png";
        peerAvatarIcon = "resources/images/guide.png";
    }

    $("#opacityRange").on("input change", function() {
        var alpha = $(this).val()/100;

        $( "#hammerVideo" ).fadeTo( 0 , alpha);
        $( "#videoContainer" ).fadeTo( 0 , alpha);
    });
    $("#sizeRange").on("input change", function() {
        size=$("#sizeRange").val()*5 +10;

        if( size > $(hammerContainer).width() || size > $(hammerContainer).height()){
            if($(hammerContainer).width()<$(hammerContainer).height()){
                size = $(hammerContainer).width();
            }
            else{
                size= $(hammerContainer).height();
            }
        }
        checkPos();
        $(hammerDraggable).width( size);
        $(hammerDraggable).height(size );
    });
}
/**
 * shows the chat box
 */
function showChat() {
    chatBox.show();
    hangUp.show();
    hangUpCollapse.show();
    spinner.css('display', 'none');
}
/**
 * hides the chat box
 */
function hideChat() {
    chatBox.hide();
    hangUp.hide();
    hangUpCollapse.hide();
}

function emptyChat(){
    chat.empty();
}
/**
 * Creates a new chat list item and
 * Appends a message sent by me to the chat
 * @param {String} message message to append to chat
 */
function appendMyMessageToChat(message) {
    //used for textarea
    message = message.replace("\n", "<br>");
    var m =
            '<li class="right clearfix">'
            + '<span class="chat-img pull-right">'
            + '<img src="' + myAvatarIcon + '" alt="My Avatar" class="img-circle">'
            + '</span>'
            + '<div class="chat-body clearfix">'
            + '<div class="header">'
            + '<small class=" text-muted"><span class="glyphicon glyphicon-time"></span>' + getCurrentTime() + '</small>'
            + '<strong class="pull-right primary-font">' + 'Me' + '</strong>'
            + '</div>'
            + '<p>' + message + '</p>'
            + '</div>'
            + '</li>'
        ;
    appendMessageToChat(m);
}

/**
 * Creates a new chat list item and
 * appends a message received by the peer to the chat
 * @param {String} message message to append to chat
 * @param {String} peername name of peer who sent the message
 */
function appendPeerMessageToChat(message, peername) {
    //used for textarea
    message = message.replace("\n", "<br>");
    var m =
            '<li class="left clearfix">'
            + '<span class="chat-img pull-left">'
            + '<img src="' + peerAvatarIcon + '" alt="Peer Avatar" class="img-circle">'
            + '</span>'
            + '<div class="chat-body clearfix">'
            + '<div class="header">'
            + '<strong class="primary-font">' + peername + '</strong> <small class="pull-right text-muted">'
            + '<span class="glyphicon glyphicon-time"></span>' + getCurrentTime() + '</small>'
            + '</div>'
            + '<p>' + message + '</p>'
            + '</div>'
            + '</li>'
        ;
    appendMessageToChat(m);
}
/**
 * Appends a message to the chat
 * @param {String} message html element that will be appended to che chat
 */
function appendMessageToChat(message) {
    chat.append(message);
    scrollToBottomOfChat(chat);
}
/**changeToSmallChat
 * scrolls to the bottom of the chat if it is not minimised
 */
function scrollToBottomOfChat() {
    //only scroll chat if it is not minimised
    if (!chatIsMinimised) {
        chat.parent().animate({scrollTop: chat.height()});
        //change minimised chat image to indicate new message
    } else {
        setSmallChatNewMessageColor();
    }
}
/**
 * hides the "normal" chat and displays the small chat
 */
function changeToSmallChat() {
    //chatBox.fadeOut();
    //smallChat.fadeIn();
    chatIsMinimised = true;
}
/**
 * hides the small chat and displays the "normal" chaat
 */
function changeToChat() {
    chatIsMinimised = false;
    setSmallChatNoMessageColor();
}
/**
 * sets the color of the small chat to "new_message"
 */
function setSmallChatNewMessageColor() {
    headingPanel.css("background-color", smallChatColors.new_message);
    primaryPanel.css("border-color", smallChatColors.new_message);
}
/**
 * sets the color of the small chat to "no_message"
 */
function setSmallChatNoMessageColor() {
    headingPanel.css("background-color", smallChatColors.no_message);
    primaryPanel.css("border-color", smallChatColors.no_message);
}
/**
 * adds the name of the peer who is typing + " is typing..." to the chat
 * @param {String} peername name of peer who is typing
 */
function peerIsTyping(peername) {
    console.log(peername + " is typing");
    spinner.css('display', 'inline');
}
/**
 * removes the "[peername] is typing..." from the chat
 */
function peerStoppedTyping() {
    console.log("stopped typing");
    spinner.css('display', 'none');
}
/**
 * displays all gui elements available for the current connection
 */
function showChatMapGUI(){
    if(supportsOnlyWebsocket()){
        showWebsocketOnlyGUI();

    }else{
        if(noMediaSupported()){
            showNoMediaGUI();
        }else{
            if(supportsAudioVideo()){
                showAudioVideoGUI();
            }else{
                if(supportsAudioOnly()){
                    showAudioOnlyGUI();
                } else if(supportsVideoOnly()){
                    showVideoOnlyGUI();
                }
                else{
                    if(shologs)console.log("nothing supported");
                }
            }
        }
    }
}
/**
 * will display the elements necessary for a websocket connection
 */
function showWebsocketOnlyGUI(){
    if(showLogs) console.log('show websocket only gui');
    showChat();
    showMap();
    $("#btn_closeConnection").show();
}
/**
 * will display the elements necessary for a connection with no media
 */
function showNoMediaGUI(){
    if(showLogs) console.log('show no media gui');
    showChat();
    showMap();
    $("#btn_closeConnection").show();
}
/**
 * will display all gui elements for a Webrtc conection
 */
function showAudioVideoGUI(){
    if(showLogs) console.log('show audio and video gui');
    showChat();
    showMap();
    showVideoControls();
    showAudioControls();
    $("#btn_closeConnection").show();

}
/**
 * will display only audio gui elements for a Webrtc conection
 */
function showAudioOnlyGUI(){
    if(showLogs) console.log('show audio only gui');
    showChat();

    showMap();
    showAudioControls();
    $("#btn_closeConnection").show();

}
/**
 * will display onyl video gui elements for a Webrtc conection
 */
function showVideoOnlyGUI(){
    if(showLogs) console.log('show video only gui');
    showChat();
    peerStoppedTyping()
    showMap();
    showVideoControls();
    $("#btn_closeConnection").show();

}
/**
 * shows the map
 */
function showMap(){
    $('#locationIcon').show();
    mapDiv.show();
    //map is not shown correctly, this will help
    resizeMap();
}
/**
 * hides the map
 */
function hideMap(){
    $('#locationIcon').hide();
    mapDiv.hide();
}
/**
 * shows the audio controls
 */
function showAudioControls(){
    audioControlsDiv.show();
}
/**
 * hides the audio controls
 */
function hideAudioControls(){
    audioControlsDiv.hide();

}
/**
 * shows the video controls
 */
function showVideoControls(){
    videoControlsDiv.show();

}
/**
 * hides the video controls
 */
function hideVideoControls(){
    videoControlsDiv.hide();

}
/**
 * hides the video div
 */
function hideVideo(){
    videoDiv.hide(250);
    videoControlsNavBarButton.css('display','none');
}
/**
 * shows the video div
 */
function showVideo(){
    videoDiv.show(250);
    videoControlsNavBarButton.css('display','block');
}

function initChat(){
    if(showLogs) console.log("init chat");
    $("#btn_chat").click(function () {
        //cannot send to peer if not connected
        if(!c2P) return;
        if(showLogs) console.log('send chat clicked');
        sendChatMessage();
    });

    $("#inp_chat").keyup(function (e) {
        //cannot send to peer if not connected
        if(!c2P) return;
        //send message when enter key is pressed
        if (e.keyCode == 13) {
            if(showLogs) console.info('enter on chat input');
            /*
            //use for line breaks
            var content = this.value;  
            var caret = getCaret(this);
            if(e.shiftKey){
                this.value = content.substring(0, caret - 1) + "\n" + content.substring(caret, content.length);
                e.stopPropagation();
            }else{
                this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
                sendChatMessage();
            }
            */
           sendChatMessage();
        }
    });

    function sendChatMessage(){
        var chatInput = $("#inp_chat");
        var message = chatInput.val();
        message = decodeEntities(message);
        sendMessageToPeer(message, true);
        chatInput.val("");
    }

    $("#inp_chat").keyup(function (e) {
        //cannot send to peer if not connected
        if(!c2P) return;
        if(showLogs) console.log('chat input lost focus');
        meIsTyping();
    });

    $("#btn_minimiseChat").click(function (e) {
        if(showLogs) console.log('btn_minimiseChat button clicked');

        if(!chatIsMinimised){
            $("#chatBox").addClass("zeroBottom");
            $("#chatBox").addClass("borderBottom");
            $(".panel").addClass("borderBottom");

            $("#btn_minimiseChat").attr("src", "resources/images/icons/arrowUp.png");
            changeToSmallChat();
        }else{
            $("#chatBox").removeClass("zeroBottom");
            $("#chatBox").removeClass("borderBottom");
            $(".panel").removeClass("borderBottom");

            $("#btn_minimiseChat").attr("src", "resources/images/icons/arrowDown.png");
            changeToChat();
        }
    });
}
/**
 * when a message arrived from SCTP or Websocket this function has to be called
 * plays a sound, appends the message to the chat, vibrates
 * @param {String} message message sent by the peer
 */
function messageArrived(message) {
    if (showLogs) console.log('messageArrived: ' + message);
    //play message sound
    playSound(sounds.message_arrival);
    vibrate(vibrations.message);
    if(message.image){
        appendPeerImageToChat(message.buffer, peername);
    }else{
        //used for textarea
        message = message.replace("\n", "<br>");
        appendPeerMessageToChat(message, peername);
    }
}


function appendPeerImageToChat(img, peername){
    var m =
            '<li class="left clearfix">'
            + '<span class="chat-img pull-left">'
            + '<img src="' + peerAvatarIcon + '" alt="Peer Avatar" class="img-circle">'
            + '</span>'
            + '<div class="chat-body clearfix">'
            + '<div class="header">'
            + '<strong class="primary-font">' + peername + '</strong> <small class="pull-right text-muted">'
            + '<span class="glyphicon glyphicon-time"></span>' + getCurrentTime() + '</small>'
            + '</div>'
            //featherlight
            + '<a href="' + img + '" data-featherlight="image">'
            + '<img src="' + img + '" alt="image" style="max-width: 100px; max-height:100px;" />'
            + '</a>'
            //featherlight
            + '</div>'
            + '</li>'
        ;
    appendMessageToChat(m);
}


function appendMyImageToChat(img) {

    var m =
            '<li class="right clearfix">'
            + '<span class="chat-img pull-right">'
            + '<img src="' + myAvatarIcon + '" alt="My Avatar" class="img-circle">'
            + '</span>'
            + '<div class="chat-body clearfix">'
            + '<div class="header">'
            + '<small class=" text-muted"><span class="glyphicon glyphicon-time"></span>' + getCurrentTime() + '</small>'
            + '<strong class="pull-right primary-font">' + 'Me' + '</strong>'
            + '</div>'
            //featherlight
            + '<a href="' + img + '" data-featherlight="image">'
            + '<img src="' + img + '" alt="image" style="max-width: 100px; max-height:100px;" />'
            + '</a>'
            //featherlight
            + '</div>'
            + '</li>'
        ;
    appendMessageToChat(m);
}

/**
 * to add a new line to the text area
 * @param {type} el
 * @returns {re@call;duplicate.text.length|Number}
 */
function getCaret(el) { 
    if (el.selectionStart) { 
        return el.selectionStart; 
    } else if (document.selection) { 
        el.focus();
        var r = document.selection.createRange(); 
        if (r == null) { 
            return 0;
        }
        var re = el.createTextRange(), rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
    }  
    return 0; 
}