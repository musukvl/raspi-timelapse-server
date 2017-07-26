"use strict";

var express = require('express');

var Promise = require('bluebird');
var co = Promise.coroutine;
var MainController = require('../controllers/MainController');

class RouteFactory {

    constructor(env) {
        this._env = env;
    }

    init() {
        var router = express.Router();

        var mainController = new MainController(this._env);
        router.get(['/'], mainController.index());

        return router;
    }
}

module.exports = RouteFactory;
