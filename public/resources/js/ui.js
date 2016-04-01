/**
 * ui.js
 * contains functions dealing with ui elements
 * used by guides and tourists
 */

//variables
var chatBox;
var chat;
var smallChat;
var chatIsMinimised;
var isTypingSpan;
var smallChatColors = {
    no_message: "#2585C4",
    new_message: "#28B294"
};
var mapDiv;
var videoDiv;
var audioDiv;

/**
 * initialises ui variables
 * !needs to be called in document.ready()!
 */
function initUI(){
    if (showLogs) console.log('init gui');
    chat = $("#chat");
    smallChat = $("#smallChat");
    chatBox = $("#chatBox");
    isTypingSpan = $("#spn_isTyping");
    mapDiv = $("#map");
    videoDiv = $("#video");
    audioDiv = $("#audio");
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
/**
 * Creates a new chat list item and
 * Appends a message sent by me to the chat
 * @param {String} message message to append to chat
 */
function appendMyMessageToChat(message) {

    var m =
            '<li class="right clearfix">'
            + '<span class="chat-img pull-right">'
            + '<img src="resources/images/me.png" alt="My Avatar" class="img-circle">'
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
            + '<img src="resources/images/peer.png" alt="Peer Avatar" class="img-circle">'
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
/**
 * scrolls to the bottom of the chat if it is not minimised
 */
function scrollToBottomOfChat() {
    //only scroll chat if it is not minimised
    if (!chatIsMinimised) {
        chat.parent().animate({scrollTop: chat.height()});
        //change minimised chat image to indicate new message
    } else {
        setSmallChatNewMessageColor(smallChat);
    }
}
/**
 * hides the "normal" chat and displays the small chat
 */
function changeToSmallChat() {
    chatBox.fadeOut();
    smallChat.fadeIn();
    chatIsMinimised = true;
}
/**
 * hides the small chat and displays the "normal" chaat
 */
function changeToChat() {
    chatBox.fadeIn();
    smallChat.fadeOut();
    chatIsMinimised = false;
    setSmallChatNoMessageColor(smallChat);
}
/**
 * sets the color of the small chat to "new_message"
 */
function setSmallChatNewMessageColor() {
    smallChat.css("background-color", smallChatColors.new_message);
}
/**
 * sets the color of the small chat to "no_message"
 */
function setSmallChatNoMessageColor() {
    smallChat.css("background-color", smallChatColors.no_message);
}
/**
 * adds the name of the peer who is typing + " is typing..." to the chat
 * @param {String} peername name of peer who is typing
 */
function peerIsTyping(peername) {
    console.log(peername + " is typing");
    isTypingSpan.text(peername + " is typing...");
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
function showGUI(){
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
    showVideo();
    showAudio();
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
    showAudio();
    $("#btn_closeConnection").show();
}
/**
 * will display onyl video gui elements for a Webrtc conection
 */
function showVideoOnlyGUI(){
    if(showLogs) console.log('show video only gui');
    showChat();
    showMap();
    //TODO show video...
    showVideo();
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
function showAudio(){
    audioDiv.show();
}
/**
 * hides the audio controls
 */
function hideAudio(){
    audioDiv.hide();
}
/**
 * shows the video controls
 */
function showVideo(){
    videoDiv.show();
}
/**
 * hides the video controls
 */
function hideVideo(){
    videoDiv.hide();
}