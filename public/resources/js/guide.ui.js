/**
 * guide.ui.js
 * contains functions related with the ui on the guide side
 * used by guides
 */
var modalDialog;
var modalContent;
var mapControls;

/**
 * initialises ui variables for guide
 * !needs to be called in document.ready()!
 */
function initGuideUI(){
    if(showLogs) console.log('guide: init gui');
    modalDialog = $("#modalDialog");
    modalContent = $("#modalContent");
    mapControls = $("#mapControls");
    
    initGuideButtons();
}

function showGuideUI(){
    if(showLogs) console.log('guide: show gui');
    mapControls.show();
}

function showModalDialog(content) {
    modalContent.text(content);
    modalDialog.show();
}

function hideModalDialog(){
    modalDialog.hide();
}

function showTouristRequestsGuidePrompt(){
    console.log('torist in need of help!!!');
    //display sound
    playSound(sounds.call_ring);
    //vibrate
    vibrate(vibrations.connectionRequest);
    
    var content = "A guide needs your help! Will you help?";
    showModalDialog(content);
}

function hideTouristRequestGuidePrompt(){
    hideModalDialog();
    stopSound();
    stopVibration();
}
/**
 * initiates all buttons used by the guide
 */
function initGuideButtons() {

    $("#modalYes").click(function () {
        if (showLogs) console.log('guide: modalYes button clicked');
        //send accepted to tourist
        guideAcceptsRequest();
        hideTouristRequestGuidePrompt();
        playSound(sounds.call_answer);
    });

    $("#modalNo").click(function () {
        if (showLogs) console.log('guide: modalNo button clicked');
        //send declined to tourist
        guideDeclinesRequest();
        hideTouristRequestGuidePrompt();
    });

}