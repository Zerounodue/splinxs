


$(document).ready(function () {
    console.log('document ready');
    //console.log('username:' +  document.session.theUsername);
   
    var name = 'Mike';
    
    var chat = io.connect('https://localhost/guide');

    chat.on('connect', function () {
        console.log('connected');

        chat.emit('state', name);
    });
    
    chat.on(name, function(msg){
       console.log('received message on my private channel: ' + msg);
    });

    $("#btn_sendMessage").on('click', function (e) {
        console.log('send message button clicked');
        
        console.log('sending on: ' + 'guide' + ', message: ' + name);
        
        chat.emit('guide', "hey!!");
        chat.emit('state', name);
        
        
    });

});