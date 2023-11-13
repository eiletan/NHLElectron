// A collection of functions used to initalize data stored in files into the application.
const fs = require('fs');
const { resolve } = require('path');
const path = require('path');
const nhlApi = require('./NhlApi.js');
const util = require('./util.js');

/**
 * Initializes team directory as a JSON object by combining data from
 * a local json file and the NHL API
 * Returns a promise
 */
function initTeams(pathToFile) {
    let finalTeamsPromise = new Promise((resolve,reject) => {
        util.retrieveFile(pathToFile).then((localTeams) => {
          return initTeamsHelper(localTeams);
        }).then((initTeamsFinal) => {
          resolve(initTeamsFinal);
        }).catch((err) => {
          reject(err);
        });
    })
    return finalTeamsPromise;   
}

function initTeamsHelper(localTeamsJson) {
    let initTeamsPromise = new Promise((resolve,reject) => {
        nhlApi.GetFromNHLApi("stats/rest/en/franchise?include=lastSeason.id", "https://api.nhle.com/").then((teams) => {
            let apiteams = teams["data"];
            let internalTeamsJson = {};
            for (let team of localTeamsJson) {
              if (team["name"].valueOf() != "NHL") {
                let obj = {};
                obj["name"] = team["name"];
                obj["logo"] = team["logo"];
                obj["color"] = team["color"];
                obj["goalHorn"] = team["goalHorn"];
                obj["hornLength"] = team["hornLength"];
                obj["abbreviation"] = team["abbreviation"];
                internalTeamsJson[obj["name"]] = obj;
              } else if (team["name"].valueOf() == "NHL") {
                internalTeamsJson["NHL"] = team;
              }
            }
            let keys = Object.keys(internalTeamsJson);
            for (let apiteam of apiteams) {
              if (apiteam["lastSeason"] === null) {
                if (keys.includes(apiteam["fullName"])) {
                  internalTeamsJson[apiteam["fullName"]]["id"] = apiteam["id"];
                  internalTeamsJson[apiteam["fullName"]]["shortName"] = apiteam["teamCommonName"];
                  internalTeamsJson[apiteam["fullName"]]["teamName"] = apiteam["fullName"];
                } else {
                  internalTeamsJson[apiteam["fullName"]]["id"] = apiteam["id"];
                  let teamNameAbr = new String(apiteam["teamPlaceName"]);
                  teamNameAbr = teamNameAbr.substring(0,3);
                  internalTeamsJson[apiteam["fullName"]]["abbreviation"] = teamNameAbr;
                  internalTeamsJson[apiteam["fullName"]]["shortName"] = apiteam["teamCommonName"];
                  internalTeamsJson[apiteam["fullName"]]["teamName"] = apiteam["fullName"];
                  internalTeamsJson[apiteam["fullName"]]["logo"] = localTeamsJson["NHL"]["logo"];
                  internalTeamsJson[apiteam["fullName"]]["color"] = localTeamsJson["NHL"]["color"];
                  internalTeamsJson[apiteam["fullName"]]["goalHorn"] = localTeamsJson["NHL"]["goalHorn"];
                }
              }
            }
            resolve(internalTeamsJson);
            return;
          }).catch((err) => {
            reject("Team data initialization failed due to (" + err +")");
            return;
        });
    });
    return initTeamsPromise;

}





module.exports = {
    initTeams: initTeams
}