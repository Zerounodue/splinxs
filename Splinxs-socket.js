/**
 * Created by Zerododici on 14.04.16.
 */
module.exports = exports = function(io) {
    //io = io(server);
//var io = require('socket.io').listen(server);

    var count =0;

    io.sockets.on('connection', function (socket) {
        count ++;
        console.log('----------2: sockets connection count: '+count);

        socket.on('online', function (msg) {
            console.log('----------3: online: ');
        });
    });



    var guideSocket = io.of('/guideChannel');
    var touristSocket = io.of('/tourist');


    guideSocket.on('connection', function (socket) {
        console.log('----------4: guide connection opened');

        socket.on('online', function (msg) {
            console.log('----------5: guide online msg: ' + msg);
            socket.username = msg;

        });

        socket.on('guide', function (msg) {
            console.log('----------5: guide: ' + msg);

            socket.emit(msg, "message: " + msg);
        });

        socket.on('disconnect', function () {
            console.log('----------5.5: disconnect: ' + socket.username);
        });

    });

    touristSocket.on('connection', function (socket) {
        console.log('----------6: tourist connection opened');

    });

};