"use strict";

var Promise = require('bluebird');
var co = Promise.coroutine;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

class StreamService {

    constructor(env, app, io) {
        this._env = env;
        this._app = app;
        this._io = io;
        this._proc = null;
    }

    onSocketConnect(socket) {
        var self = this;
        self._env.logger().info("onSocketConnect");

        socket.on('disconnect', function() {
            self._env.logger().info("onSocketConnect - > disconnect");
        });

        socket.on('start-stream', function() {
            self.startStreaming(self._io);
        });

        socket.on('stop-stream', function() {
            self.stopPreviewGenerator();
        });
    }

    startPreviewGenerator() {
        var self = this;
        try {
            if (!self._proc) {
                try {
                    self._proc.kill()
                }catch (e) {
                }
            }

            var args = ["-w", "640", "-h", "480", "-o", "./static/stream/image_stream.jpg", "-t", "999999999", "-tl", "500", "-hf", "-vf", "-q", "70"];
            self._proc = spawn('raspistill', args);

            self._proc.stdout.on('data', (data) => {
                self._env.logger().info('spawned process data:' + data.toString());
            });

            self._proc.stderr.on('data', (data) => {
                self._env.logger().info(`spawned stderr: ${data}`);
            });

            self._proc.on('error', (err) => {
                self._env.logger().error("spawned process error " + err.message);
            });
            self._proc.on('close', (code) => {
                self._env.logger().info("spawned process  exited with code " + code);
            });

            self._env.logger().info("process spawned");

        } catch (e) {
            self._io.sockets.emit('error-message', e.message);
        }
    }

    stopPreviewGenerator(){
        var self = this;
        if (self._proc) {
            self._proc.kill();
            self._env.logger().info("process killed");
        }
    }

    onLastSocketDisconnected() {
        var self = this;
        self._env.logger().info("onLastSocketDisconnected");
        self.stopPreviewGenerator();
    }

    startStreaming() {
        var self = this;
        self._env.logger().info("startStreaming");
        self.startPreviewGenerator();

        fs.watchFile('./static/stream/image_stream.jpg', function(current, previous) {
            self._env.logger().info("file updated");
            self._io.sockets.emit('liveStream', '/stream/image_stream.jpg?_t=' + (Math.random() * 100000));
        })
    }

}

module.exports = StreamService;