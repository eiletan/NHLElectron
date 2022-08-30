// A collection of functions used to initalize data stored in files into the application.
const fs = require('fs');
const { resolve } = require('path');
const path = require('path');
const nhlApi = require('./NhlApi.js');

/**
 * Initializes team directory as a JSON object by combining data from
 * a local json file and the NHL API
 * Returns a promise
 */
function initTeams() {
    let pathToFile = path.join(__dirname, "..", "assets", "teams", "teams.json")
    let localTeamsPromise = new Promise((resolve,reject) => {
        fs.readFile(pathToFile,(err,data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                data = JSON.parse(data);
                resolve(data);   
            }
        });
    })
    let finalTeamsPromise = new Promise((resolve,reject) => {
        localTeamsPromise.then((localTeams) => {
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
            console.log(Object.keys(teams));
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
          }).catch((err) => {
            reject("Team data initialization failed due to (" + err +")");
        });
    });
    return initTeamsPromise;

}





module.exports = {
    initTeams: initTeams
}