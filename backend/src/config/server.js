const config = require('./config');
const Server = require('../core/Server');
const SocketProcessor = require('../core/SocketProcessor');

function init(app) {
    let server = new Server(app);
    let socketProcessor = new SocketProcessor(server.server);

    return server;
}

module.exports = { init };