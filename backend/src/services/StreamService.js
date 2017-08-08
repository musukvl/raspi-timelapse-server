const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const config = require('../config/config');
const logger = require('../config/log')("stream-service");
const moment = require('moment');

class StreamService {

    constructor(io) {
        this._io = io;
        this._muteLog = false;
    }

    onSocketConnect(socket) {
        logger.info("onSocketConnect");

        socket.on('disconnect', () => {
            this.emitInfoLog("onSocketConnect - > disconnect");
        });

        socket.on('start-stream', () => {
            this.startStreaming(this._io);
        });

        socket.on('stop-stream', () => {
            this.stopPreviewGenerator();
        });

        socket.on('start-timelapse', (x) => {
            this.startTimelapse(x);
        });

        socket.on('stop-timelapse', () => {
            this.stopTimelapse();
        });

        socket.on('mute-log', () => {
            this.emitInfoLog("Log muted");
            this._muteLog = true;
        });

        socket.on('unmute-log', () => {
            this._muteLog = false;
            this.emitInfoLog("Log unmuted");
        });
    }

    startPreviewGenerator() {
        try {
            if (!this._previewProc) {
                try {
                    this._previewProc.kill()
                }catch (e) {
                }
            }

            var args = ["-w", "640", "-h", "480", "-o", "./src/public/stream/image_stream.jpg", "-t", "999999999", "-tl", "700", "-hf", "-vf", "-q", "70"];
            this._previewProc = spawn('raspistill', args);

            this._previewProc.stdout.on('data', (data) => {
                this.emitInfoLog('preview process data:' + data.toString());
            });

            this._previewProc.stderr.on('data', (data) => {
                this.emitInfoLog(`Preview process stderr: ${data}`);
            });

            this._previewProc.on('error', (err) => {
                this.emitInfoLog("Preview process error " + err.message);
            });
            this._previewProc.on('close', (code) => {
                this.emitInfoLog("Preview process exited with code " + code);
            });

           this.emitInfoLog(`Preview process spawned pid: ${this._previewProc.pid}`);

        } catch (e) {
            this.emitInfoLog(e.message);
        }
    }

    stopPreviewGenerator(){
        try {
            if (this._previewProc) {
                this._previewProc.kill();
                this._previewProc = null;
                this.emitInfoLog("Preview process killed");
            }
            else {
                this.emitInfoLog("Preview process already killed");
            }
        }catch(e) {
            this.emitInfoLog("Error killing preview process: " + e.message);
        }
    }


    startTimelapse(options) {
        this.emitInfoLog("start timelapse with following options = " + JSON.stringify(options));

        if (config("env") !== "raspberry") {
            this.emitInfoLog("Not Raspberry environment cannot start timelapse");
            return;
        }

        try {
            var args = ["/home/pi/dev/cam/main.py", "timelapse", "-o", options.output, "--period=" + options.period ];
            this._timelapseProc = spawn('python', args);

            this._timelapseProc.stdout.on('data', (data) => {
                this.emitInfoLog('spawned process data:' + data.toString());
            });

            this._timelapseProc.stderr.on('data', (data) => {
                this.emitInfoLog(data.toString());
            });

            this._timelapseProc.on('error', (err) => {
                this.emitInfoLog("spawned process error " + err.message);
            });
            this._timelapseProc.on('close', (code) => {
                this.emitInfoLog("Spawned process  exited with code " + code);
            });

            this.emitInfoLog(`Timelapse process spawned: ${this._timelapseProc.pid}`);
        }catch (e){
            this.emitInfoLog("Cannot spawn timelapse process");
        }
    }

    stopTimelapse() {
        try {
            if (this._timelapseProc) {
                this._timelapseProc.kill();
                this._timelapseProc = null;
                this.emitInfoLog("Timelapse process killed");
            }
            else {
                this.emitInfoLog("Timelapse process already killed");
            }
        }catch(e) {
            this.emitInfoLog("Error killing timelapse process: " + e.message);
        }
    }


    onLastSocketDisconnected() {
        logger.info("onLastSocketDisconnected");
        this.stopPreviewGenerator();
    }

    startStreaming() {
        this.emitInfoLog("Start preview streaming");
        this.startPreviewGenerator();

        fs.watchFile('./src/public/stream/image_stream.jpg', (current, previous) => {
            this.emitInfoLog(moment().format('YYYY.MM.DD h:mm:ss') + " file updated");
            this._io.sockets.emit('liveStream', '/stream/image_stream.jpg?_t=' + (Math.random() * 100000));
        })
    }

    emitInfoLog(message) {
        if (!message || this._muteLog)
            return;
        message = message.trim().replace('[MainThread ] [INFO ]');
        message.
        logger.info(message);
        this._io.sockets.emit('log-message', message);
    }
}

module.exports = StreamService;