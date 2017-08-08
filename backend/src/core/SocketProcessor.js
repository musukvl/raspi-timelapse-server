var SocketIO = require('socket.io');
var StreamService = require('../services/StreamService');
const logger = require('../config/log')("socket-processor");

class SocketProcessor {

    constructor(server) {
        this._io = SocketIO(server);
        this._sockets = [];

        this._streamService = new StreamService(this._io);

        this._io.on('connection', (socket) => {

            this._sockets[socket.id] = socket;
            logger.info("Total clients connected : ", Object.keys(this._sockets).length);

            this._streamService.onSocketConnect(socket);

            socket.on('disconnect', () => {
                delete this._sockets[socket.id];
                logger.info('socket disconnect');

                // no more sockets, kill the stream
                if (Object.keys(this._sockets).length == 0) {
                    logger.info('last socket disconnected');
                    this._streamService.onLastSocketDisconnected();
                }
            });
        });

    }

}

module.exports = SocketProcessor;