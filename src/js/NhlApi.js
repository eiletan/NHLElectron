// A collection of functions used for calling the public NHL API
const DOMAIN = "https://statsapi.web.nhl.com/api/v1";

/**
 * Makes a GET request to the NHL API
 * @param {String} uri uri for the NHL API ex. "/teams"
 * @returns {Promise} Promise that resolves with the API response in JSON format
 */
function GetFromNHLApi(uri) {
    let getPromise = new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject("Call to NHL api failed due to: " + xhr.statusText);
                }
                
            }
        }
        xhr.open("GET", DOMAIN + uri);
        xhr.send();
    })
    return getPromise;
}

module.exports = {
    GetFromNHLApi: GetFromNHLApi 
}