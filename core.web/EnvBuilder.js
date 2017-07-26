"use strict";

var Promise = require('bluebird');
var co = Promise.coroutine;
var AppEnvironment = require('./AppEnvironment');

class EnvBuilder {

    constructor(config) {
        this.config = config;
    }

    build() {
        var self = this;

        var appEnv =
            co(function*() {
                var appEnv = new AppEnvironment(self.config);
                return appEnv;
            })();
        return Promise.resolve(appEnv);
    }
}

module.exports = EnvBuilder;