


$(document).ready(function () {
    console.log('document ready');
   
    var name = 'Mike';
    
    var chat = io.connect('https://localhost/guideChannel');

    chat.on('connect', function () {
        console.log('connected');

        chat.emit('online', name);
    });
    
    chat.on(name, function(msg){
       console.log('received message on my private channel: ' + msg);
    });

    $("#btn_sendMessage").on('click', function (e) {
        console.log('send message button clicked');
        
        console.log('sending on: ' + 'guide' + ', message: ' + name);
        
        chat.emit('guide', "hey!!");
        
        
    });

});