/**
 * ui.js
 * contains functions dealing with ui elements
 * used by guides and tourists
 */

//variables

//div containing the chat
var chatBox;
//TODO no idea??
var chat;
//chat elements
var headingPanel;
var primaryPanel;
var isTypingSpan;

var chatIsMinimised=false;


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

var myAvatarIcon;
var peerAvatarIcon;

/**
 * initialises ui variables
 * !needs to be called in document.ready()!
 */
function initUI(isGuide){
    if (showLogs) console.log('init gui');
    //TODO makes this sense? doese chat exist?
    chat = $("#chat");
    headingPanel = $("#headingPanel");
    primaryPanel = $("#primaryPanel");
    //smallChat = $("#smallChat");
    chatBox = $("#chatBox");
    isTypingSpan = $("#spn_isTyping");
    mapDiv = $("#hammerContainer");
    videoDiv=$("#hammerVideo");
    videoControlsDiv = $("#videoControlsBox");
    audioControlsDiv = $("#audioControlsBox");
    if(isGuide){
        myAvatarIcon = "../resources/images/guide.png";
        peerAvatarIcon = "../resources/images/tourist.png";
    }
    else{
        myAvatarIcon = "../resources/images/tourist.png";
        peerAvatarIcon = "../resources/images/guide.png";
    }
}
/**
 * shows the chat box
 */
function showChat() {
    chatBox.show();
}
/**
 * hides the chat box
 */
function hideChat() {
    chatBox.hide();
}

//TODO remove these two functions
/**
 * shows the small chat
 */
function showSmallChat() {
    smallChat.show();
}
/**
 * hides the small chat
 */
function hideSmallChat() {
    smallChat.hide();
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

    var m =
            '<li class="right clearfix">'
            + '<span class="chat-img pull-right">'
            + '<img src="' + myAvatarIcon + '" alt="My Avatar" class="img-circle">'
            + '</span>'
            + '<div class="chat-body clearfix">'
            + '<div class="header">'
            + '<small class=" text-muted"><span class="glyphicon glyphicon-time"></span>' + getCurrentTime() + '</small>'
            + '<strong class="pull-right primary-font">' + 'me' + '</strong>'
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
    //chatBox.fadeIn();
    //smallChat.fadeOut();
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
    //isTypingSpan.text(peername + " is typing...");
    isTypingSpan.text("...");
}
/**
 * removes the "[peername] is typing..." from the chat
 */
function peerStoppedTyping() {
    console.log("stopped typing");
    isTypingSpan.text("");
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
                }//TODO else?? show waring?
                else{
                    console.warn("nothing supported");
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
    //TODO hide mic, video, etc.
    $("#btn_closeConnection").show();


}
/**
 * will display the elements necessary for a connection with no media
 */
function showNoMediaGUI(){
    if(showLogs) console.log('show no media gui');
    showChat();
    showMap();
    //TODO hide mic, video, etc.
    //TODO peer might have media available
    $("#btn_closeConnection").show();

}
/**
 * will display all gui elements for a Webrtc conection
 */
function showAudioVideoGUI(){
    if(showLogs) console.log('show audio and video gui');
    showChat();
    showMap();
    //TODO show audio, video, etc.
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
    //TODO show audio...
    showAudioControls();
    $("#btn_closeConnection").show();

}
/**
 * will display onyl video gui elements for a Webrtc conection
 */
function showVideoOnlyGUI(){
    if(showLogs) console.log('show video only gui');
    showChat();
    showMap();
    showVideoControls();
    $("#btn_closeConnection").show();

}
/**
 * shows the map
 */
function showMap(){
    mapDiv.show();
    //map is not shown correctly, this will help
    resizeMap();
}
/**
 * hides the map
 */
function hideMap(){
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
    videoDiv.hide();
}
/**
 * shows the video div
 */
function showVideo(){
    videoDiv.show();
}

function initChat(){
    if(showLogs) console.log("init chat");
    $("#btn_chat").click(function () {
        //cannot send to peer if not connected
        if(!c2P) return;
        if(showLogs) console.log('send chat clicked');
        var chatInput = $("#inp_chat");
        var message = chatInput.val();
        sendMessageToPeer(message, true);
        chatInput.val("");
    });

    $("#inp_chat").keypress(function (e) {
        //cannot send to peer if not connected
        if(!c2P) return;
        //send message when enter key is pressed
        if (e.which == 13) {
            if(showLogs) console.log('enter on chat input');
            var chatInput = $("#inp_chat");
            var message = chatInput.val();
            sendMessageToPeer(message, true);
            chatInput.val("");
        }
    });

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

            //$("#footerPanel").addClass("hidden");
            //$("#footerPanel").hide("Blind",500);
            $("#btn_minimiseChat").attr("src", "../resources/images/icons/arrowUp.png");
            //$("#chat").addClass("hidden");
            changeToSmallChat();
        }else{
            $("#chatBox").removeClass("zeroBottom");
            $("#chatBox").removeClass("borderBottom");
            $(".panel").removeClass("borderBottom");

            //$("#footerPanel").show("Blind", 500);
            //$("#footerPanel").removeClass("hidden");
            $("#btn_minimiseChat").attr("src", "../resources/images/icons/arrowDown.png");
            changeToChat();
        }


    });
    /*
    $("#btn_minimiseChat").click(function (e) {
        if(showLogs) console.log('minimise chat');
        changeToSmallChat();
    });

    $("#smallChat").click(function (e) {
        if(showLogs) console.log('maximising chat');
        changeToChat();
    });
    */
}