const express = require('express');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

async function index(req, res, next) {

    let outputFolders = [];

    if (config("env") != "raspberry") {
        outputFolders = [{name: "USB128", fullPath: "/media/pi/USB128"}, {name: "USB32", fullPath: "/media/pi/USB32"}];
    }
    else {
        outputFolders = getOutputFolders();
    }

    outputFolders = getOutputFolders();
    res.render('index', { title: 'Express', outputFolders :  outputFolders});
}

function getOutputFolders() {
    const mediaFolder = "/media/pi/";
    let mediaFiles = fs.readdirSync(mediaFolder, 'utf8');
    let result = mediaFiles
        .filter(x => x != "SETTINGS" && x != "data")
        .map(x => path.join(mediaFolder, x))
        .filter((x) => {

            return fs.statSync(x).isDirectory();
        })
        .map((x) => {
            return {name: path.basename(x), fullPath: x};
        });

    result.push({
        name: "Pictures",
        fullPath: "/home/pi/Pictures"
    });
    return result;
}

const router = express.Router();

router.get('/', index);

module.exports = router;
