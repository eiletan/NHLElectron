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

/**
 * Compares two team names. Ignores accents and case, and is capable of comparing shortened versions of team names. Ex. "Vancouver Canucks" and "Canucks" would be equivalent.
 * @param {String} teamNameA First team name to be compared
 * @param {String} teamNameB Second team name to be compared
 * @returns True if the teams are the same, false otherwise
 */
 function matchTeamName(teamNameA, teamNameB) {
    try {
        teamNameA = decodeURIComponent(escape(teamNameA));
        teamNameB = decodeURIComponent(escape(teamNameB));
        teamNameA = teamNameA.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        teamNameB = teamNameB.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        teamNameA = teamNameA.toLowerCase();
        teamNameB = teamNameB.toLowerCase();
    } catch {
        teamNameA = teamNameA.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        teamNameB = teamNameB.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        teamNameA = teamNameA.toLowerCase();
        teamNameB = teamNameB.toLowerCase();
    }

    if (teamNameA.valueOf() == teamNameB.valueOf()) {
        return true;
    } else {
        teamADelimited = teamNameA.split(" ");
        for (word of teamADelimited) {
            if (word.valueOf() == teamNameB.valueOf()) {
                return true;
            }
        }
    }
    return false;
}

module.exports = {
    retrieveFile: retrieveFile,
    matchTeamName: matchTeamName
}