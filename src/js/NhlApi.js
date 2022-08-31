// A collection of functions used for calling the public NHL API
const https = require('https');

const DOMAIN = "https://statsapi.web.nhl.com/api/v1";

/**
 * Makes a GET request to the NHL API
 * @param {String} uri uri for the NHL API ex. "/teams"
 * @returns {Promise} Promise that resolves with the API response in JSON format
 */
function GetFromNHLApi(uri) {
    let getPromise = new Promise((resolve,reject) => {
    https.get(DOMAIN+uri,(result) => {
        let resp = '';
        result.on('data', (data) => {
            resp = resp + data;
        });
        result.on('end', () => {
            resp = JSON.parse(resp);
            resolve(resp);
            return;
        });
        }).on('error',(err) => {
            reject(err);
            return;
        });
    })
    return getPromise;
}

module.exports = {
    GetFromNHLApi: GetFromNHLApi 
}