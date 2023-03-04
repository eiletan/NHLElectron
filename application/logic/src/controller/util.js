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

/**
 * Checks whether the passed in string is in the desired format of yyyy-mm-dd
 * @param {String} dateStr The date as a string
 */
function checkDateFormat(dateStr) {
    try {
        if (dateStr.length != 10){
            return false;
        }
        let dates = [dateStr.slice(0,4),dateStr.slice(5,7),dateStr.slice(8,10)];
        for (let d of dates) {
            if (parseInt(d) === NaN) {
                return false;
            }
        }
        let separators = [dateStr.slice(4,5), dateStr.slice(7,8)];
        for (let s of separators) {
            if (s != "-") {
                return false;
            }
        }
        return true;
    } catch (err) {
        return false;
    }
    
}

module.exports = {
    retrieveFile: retrieveFile,
    matchTeamName: matchTeamName,
    checkDateFormat: checkDateFormat
}