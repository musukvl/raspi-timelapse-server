const config = require('nconf').file({ file: 'src/config.json' });

function getConfigParam(param) {
    return config.get(param);
}

module.exports = getConfigParam;