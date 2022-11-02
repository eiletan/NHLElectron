// A collection of functions used for calling the public NHL API
import axios from "axios";
const DOMAIN = "https://statsapi.web.nhl.com/api/v1";



/**
 * Makes a GET request to the NHL API
 * @param {String} uri uri for the NHL API ex. "/teams"
 * @returns {Promise} Promise that resolves with the API response in JSON format
 */
export function GetFromNHLApi(uri) {
    let getPromise = new Promise((resolve,reject) => {
        axios.get(DOMAIN + uri).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
    return getPromise;
}

