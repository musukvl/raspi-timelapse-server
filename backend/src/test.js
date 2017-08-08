const path = require('path');
const fs = require('fs');

function getOutputFolders() {
    const mediaFolder = "G:\\temp\\media";
    let mediaFiles = fs.readdirSync(mediaFolder, 'utf8');
    let result = mediaFiles
        .map(x => path.join(mediaFolder, x))
        .filter((x) => {
            console.log(x);

            return fs.statSync(x).isDirectory();
        })
        .map((x) => {
            return {name: path.basename(x), fullPath: x};
        });
    return result;
}



console.log(getOutputFolders());