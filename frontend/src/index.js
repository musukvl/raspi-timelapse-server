import _ from 'lodash';
import $ from 'jquery';
import  './styles/main.scss';

let socket = io();

$().ready(() => {

    $('#start-stream').click(() => {
        socket.emit('start-stream');
    });

    $('#stop-stream').click(() => {
        socket.emit('stop-stream');
    });

    $('#clean-log').click(() => {
        $('#log-text-area').val('');
    });

    $('#mute-log').click(() => {
        socket.emit('mute-log');
    });
    $('#unmute-log').click(() => {
        socket.emit('unmute-log');
    });


    $('#start-timelapse').click(() => {
        socket.emit('start-timelapse', {period: $('#timelapse-period').val(), output: $('#timelapse-output').val() });
    });

    $('#stop-timelapse').click(() => {
        socket.emit('stop-timelapse');
    });

});


socket.on('liveStream', function(url) {
    $('#stream').attr('src', url);
});

socket.on('log-message', function(message){
    var logWindow = $('#log-text-area');
    logWindow.val(message.trim() + "\r\n" + logWindow.val());
});
