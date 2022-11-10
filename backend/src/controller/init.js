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
        nhlApi.GetFromNHLApi("/teams").then((teams) => {
            let apiteams = teams["teams"];
            let internalTeamsJson = {};
            for (team of localTeamsJson) {
              if (team["name"].valueOf() != "NHL") {
                let obj = {};
                obj["name"] = team["name"];
                obj["logo"] = team["logo"];
                obj["color"] = team["color"];
                obj["goalHorn"] = team["goalHorn"];
                internalTeamsJson[obj["name"]] = obj;
              } else if (team["name"].valueOf() == "NHL") {
                internalTeamsJson["NHL"] = team;
              }
            }
            let keys = Object.keys(internalTeamsJson);
            for (apiteam of apiteams) {
              if (apiteam["active"] === true) {
                if (keys.includes(apiteam["name"])) {
                  internalTeamsJson[apiteam["name"]]["id"] = apiteam["id"];
                  internalTeamsJson[apiteam["name"]]["abbreviation"] = apiteam["abbreviation"];
                  internalTeamsJson[apiteam["name"]]["shortName"] = apiteam["shortName"];
                  internalTeamsJson[apiteam["name"]]["teamName"] = apiteam["teamName"];
                } else {
                  internalTeamsJson[apiteam["name"]]["id"] = apiteam["id"];
                  internalTeamsJson[apiteam["name"]]["abbreviation"] = apiteam["abbreviation"];
                  internalTeamsJson[apiteam["name"]]["shortName"] = apiteam["shortName"];
                  internalTeamsJson[apiteam["name"]]["teamName"] = apiteam["teamName"];
                  internalTeamsJson[apiteam["name"]]["logo"] = localTeamsJson["NHL"]["logo"];
                  internalTeamsJson[apiteam["name"]]["color"] = localTeamsJson["NHL"]["color"];
                  internalTeamsJson[apiteam["name"]]["goalHorn"] = localTeamsJson["NHL"]["goalHorn"];
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