// A collection of utility functions
const fs = require('fs');

/**
 * 
 * @param {String} path Path to the file as a string
 * @param {Boolean} needParse True by default. If true, parses the file as JSON before returning
 * @returns 
 */
function retrieveFile(path, needParse=true) {
    let filePromise = new Promise((resolve,reject) => {
        fs.readFile(path,(err,data) => {
            if (err) {
                reject(err);
                return;
            } else {
                if (needParse) {
                    data = JSON.parse(data);
                }
                resolve(data);
                return;   
            }
        });
    })
    return filePromise;
}

module.exports = {
    retrieveFile: retrieveFile
}