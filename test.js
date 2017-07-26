"use strict";

var ApiKey = require('./model/ApiKey');


var Promise = require('bluebird');
var co = Promise.coroutine;
var EnvBuilder = require('./core.web/EnvBuilder');
var config = require('nconf').file({ file: 'config.json' });

co(function* () {
    var builder = new EnvBuilder(config);
    var appEnv = yield builder.build();

    //var Event = require('./model/Event');

    //var event = new Event({type: "123", data: {some:"data"}});
    //yield event.save();

    //var apiKey = new ApiKey({key: "qx9FPWb?x!?ijsGBm6L0|]gg,uuN(BFa"});
    //yield apiKey.save();
    var users = yield ApiKey.find({});
    console.log(users);

})();

 /**/