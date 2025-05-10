// A collection of functions used to retrieve and process game schedules and game data.
const nhlApi = require('./NhlApi.js');
const util = require('./util.js');
const jp = require('jsonpath');

var NOTIFLENGTH = 20000;

const multiwordlocations = ["STL", "NYI", "NYR"];

/**
 * Find all NHL games occuring on the passed in date
 * @param {String} date Date of the game - Must be in format "YYYY-MM-DD"
 * @returns {Promise} Promise that resolves with the list of games for the date as an array 
 */
function findGames(date) {
    let gamesList = null;
    let scheduledGamesPromise = new Promise((resolve,reject) => {
        nhlApi.GetFromNHLApi("schedule/" + date).then((games) => {
            if (games["gameWeek"].length == 0) {
                let empty = [];
                resolve(empty);
                return;
            } else {
                gamesList = games["gameWeek"][0]["games"];
                return supplementGamesData(gamesList);
            }
        }).then((gamesList) => {
            resolve(gamesList);
            return;
        }).catch((err) => {
            reject("An error occurred: Games for " + date + " could not be retrieved. Please try again");
            console.log(err);
            return;
        });
    });
    return scheduledGamesPromise;
}


function supplementGamesData(gamesList) {
    
    let promise = new Promise((resolve,reject) => {
        nhlApi.GetFromNHLApi("stats/rest/en/team", "https://api.nhle.com/").then((response) => {
            let teams = response["data"];
            for (let game of gamesList) {
                let awayFound = false;
                let homeFound = false;
                let awayId = game["awayTeam"]["id"];
                let homeId = game["homeTeam"]["id"];
                for (let team of teams) {
                    if (awayFound && homeFound) {
                        break;
                    }
                    let teamId = team["id"];
                    if (teamId == awayId) {
                        let gameAwayObject = {...game["awayTeam"],...team};
                        game["awayTeam"] = gameAwayObject;
                        awayFound = true;
                        continue;
                    }
                    if (teamId == homeId) {
                        let gameHomeObject = {...game["homeTeam"],...team};
                        game["homeTeam"] = gameHomeObject;
                        homeFound = true;
                        continue;
                    }
                }
            }
            resolve(gamesList);
            return;
        }).catch((err) => {
            console.log("Could not retrive teams due to: " + err);
            reject(err);
        });
    });
    return promise;
}

/**
 * Creates an internal record of a NHL game and saves it to local storage.
 * @param {String} gameid API internal ID of a NHL Game
 * @param {Object} teams Internal record of teams
 * @param {Object} mock Mock object of api response. Intended for testing
 * @returns a Promise that resolves with an JSON object when the internal record of the game is created and saved to local storage
 */
 function createGame(gameid,teams,mock = null) {
    let createGamePromise = new Promise((resolve, reject) => {
        if (mock) {
            createGameHelper(gameid, mock, teams).then((gameObj) => {
                resolve(gameObj);
                return;
            }).catch((err) => {
                reject(err);
                return;
            });  
        }
        else {
            let gameObjRet;
            nhlApi.GetFromNHLApi("gamecenter/" + gameid + "/landing").then((response) => {
                return createGameHelper(gameid, response, teams);
            }).then((gameObj)=> {
                // Determine if this is a playoff game
                gameObjRet = gameObj;
                return findPlayoffGame(gameObj);
            }).then((playoffObj) => {
                gameObjRet["playoffSeries"] = playoffObj;
                console.log(gameObjRet);
                resolve(gameObjRet);
                return;
            })
            .catch((err) => {
                reject("Game could not be created due to: " +err);
                return;
            });
        }
    });
    return createGamePromise;
}

/**
 * A helper function for the createGame that creates the game object for internal use
 * @param {Object} response Response from the NHL API or a mock response object (for testing)
 * @param {Object} teams Internal teams object
 * @returns The game object for internal use, or throws an error
 */
function createGameHelper(gameid, response, teams) {
    let createGameHelperPromise = new Promise((resolve,reject) => {
        let goals = extractAllGoalsScored(response);
        let homeTeam = response["homeTeam"];
        let awayTeam = response["awayTeam"];
        let homeTeamName = tempFixToMultiWordLocations(homeTeam);
        let awayTeamName = tempFixToMultiWordLocations(awayTeam);
        let gameObj = {};
        gameObj["season"] = response["season"];
        if (!teams[homeTeamName]) {
            let nhlTeamCopy = JSON.parse(JSON.stringify(teams["NHL"]));
            gameObj["home"] = nhlTeamCopy;
            gameObj["home"]["name"] = homeTeamName;
            gameObj["home"]["abbreviation"] = response["homeTeam"]["abbrev"];
            gameObj["home"]["shortName"] = homeTeamName;
            gameObj["home"]["teamName"] = homeTeamName;
            gameObj["home"]["color"] = "#0000FF";
            gameObj["home"]["id"] = response["homeTeam"]["id"];
        } else {
            gameObj["home"] = teams[homeTeamName];
        }
        if (!teams[awayTeamName]) {
            let nhlTeamCopy = JSON.parse(JSON.stringify(teams["NHL"]));
            gameObj["away"] = nhlTeamCopy;
            gameObj["away"]["name"] = awayTeamName;
            gameObj["away"]["abbreviation"] = response["awayTeam"]["abbrev"];
            gameObj["away"]["shortName"] = awayTeamName;
            gameObj["away"]["teamName"] = awayTeamName;
            gameObj["away"]["color"] = "#FF0000";
            gameObj["away"]["id"] = response["awayTeam"]["id"];   
        } else {
            gameObj["away"] = teams[awayTeamName];
        }
        gameObj["id"] = gameid;
        gameObj["allGoals"] = goals;
        gameObj["currentState"] = extractGameState(response);
        gameObj["playoffSeries"] = null;
        gameObj["areGoalsUpdated"] = false;
        // The NHL API does not have an accurate score in the goal object if it is the game winning goal scored in a shootout
        // so this fixes it
        if (gameObj["currentState"]["period"] == "SO" && gameObj["currentState"]["periodTimeRemaining"] == "Final") {
            let awayGoals = gameObj["currentState"]["away"]["goals"];
            let homeGoals = gameObj["currentState"]["home"]["goals"];
            gameObj["allGoals"][0]["about"]["goals"]["away"] = awayGoals;
            gameObj["allGoals"][0]["about"]["goals"]["home"] = homeGoals;
        }
        resolve(gameObj);
        return;
    });
    return createGameHelperPromise;
}


function tempFixToMultiWordLocations(team) {
    if (multiwordlocations.includes(team["abbrev"])) {
        switch(team["abbrev"]) {
            case "NYI":
                return "New York Islanders";
            case "NYR":
                return "New York Rangers";
            case "STL":
                return "St. Louis Blues";
        }
    } else {
        let placeNameLength = team["placeName"]["default"].length;
        // If team name contains place name already, do not duplicate it;
        if (team["placeName"]["default"] == team["commonName"]["default"].substring(0,placeNameLength)) {
            return team["commonName"]["default"];
        } else {
            return team["placeName"]["default"] + " " + team["commonName"]["default"];
        }
        
    }
}

  /**
   * Function which finds playoff information about the given game
   * @param {Object} gameObj - internal JSON object representing a game
   * @param {String} teamA Team abbrev of one of the teams
   * @param {String} teamB Team abbrev of the other team
   * @returns JSON object containing the playoff round, game number, and game series status
   */
  function findPlayoffGame(gameObj) {
    let playoffProm = new Promise((resolve) => {
        let season = gameObj["season"];
        let gameId = gameObj["id"];
        let playoffObj = {};
        nhlApi.GetFromNHLApi(`playoff-series/carousel/${season}`).then((playoffInfo) => {
            let currentRound = playoffInfo["currentRound"];
            let rounds = playoffInfo["rounds"];
            let teamA = gameObj["home"]["abbreviation"];
            let teamB = gameObj["away"]["abbreviation"];
            for (let i = rounds.length-1; i >= 0; i--) {
                let round = rounds[i];
                if (round["roundNumber"] == currentRound) {
                    let series = round["series"];
                    for (match of series) {
                        let apiTeamA = match["topSeed"]["abbrev"];
                        let apiTeamB = match["bottomSeed"]["abbrev"];
                        if (apiTeamA == teamA) {
                            if (apiTeamB == teamB) {
                                playoffObj = extractPlayoffSeriesState(match, apiTeamA, apiTeamB, currentRound);
                                break;
                            }
                        }
                        if (apiTeamB == teamA) {
                            if (apiTeamA == teamB) {
                                playoffObj = extractPlayoffSeriesState(match, apiTeamA, apiTeamB, round);
                                break;
                            } 
                        }
                    }
                }
            }
            // Once playoff series data has been extracted, make a separate call to acquire current game number
            return nhlApi.GetFromNHLApi(`schedule/playoff-series/${season}/${playoffObj["seriesID"]}`);
        }).then((seriesData) => {
            let games = seriesData["games"];
            for (let j = games.length-1; j >= 0; j--) {
                let game = games[j];
                if (game["id"] == gameId) {
                    playoffObj["currentGame"] = game["gameNumber"];
                    playoffObj["currentGameLabel"] = `Game ${playoffObj["currentGame"]}`;
                }
            }
            // Construct status
            playoffObj["status"] = determinePlayoffSeriesLeader(playoffObj["topSeedWins"], playoffObj["topSeed"], 
                playoffObj["bottomSeedWins"], playoffObj["bottomSeed"], playoffObj["neededToWin"])
            resolve(playoffObj);
        }).catch((err) => {
            // If response is an error, return nothing
            resolve(null);
        });
    });
    return playoffProm;
  }

  function extractPlayoffSeriesState(series, teamA, teamB, round) {
    let playoffObj = {};
    let seriesLabel = series["seriesLabel"];
    seriesLabel = seriesLabel.replace(/-/g, " ");
    seriesLabel = seriesLabel.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    playoffObj["round"] = round;
    playoffObj["roundLabel"] = seriesLabel
    playoffObj["seriesID"] = series["seriesLetter"];
    playoffObj["topSeed"] = teamA;
    playoffObj["bottomSeed"] = teamB;
    playoffObj["topSeedWins"] = series["topSeed"]["wins"];
    playoffObj["bottomSeedWins"] = series["bottomSeed"]["wins"];
    playoffObj["neededToWin"] = series["neededToWin"];
    return playoffObj;
  }


  function determinePlayoffSeriesLeader(topSeedW, topSeed, bottomSeedW, bottomSeed, neededToWin) {
    if (topSeedW == bottomSeedW) {
        return `Series tied ${topSeedW}-${topSeedW}`;   
    } else if (topSeedW == neededToWin) {
        return `${topSeed} wins ${topSeedW}-${bottomSeedW}`;
    } else if (bottomSeedW == neededToWin) {
        return `${bottomSeed} wins ${bottomSeedW}-${topSeedW}`; 
    } else if (topSeedW > bottomSeedW) {
        return `${topSeed} leads ${topSeedW}-${bottomSeedW}`;
    } else {
        return `${bottomSeed} leads ${bottomSeedW}-${topSeedW}`;
    }
  }




/**
 * Gets a live update for the game specified by gameid and returns all goals scored in the game at the present moment as an array
 * @param {String} gameid API internal ID of a NHL Game
 * @param {Object} prevGame The game object to be updated
 * @param {Object} mock Mock object of NHL api response. Intended for testing
 * @returns a Promise that resolves with an array that contains all goals scored currently from last to first.
 */
 function getAllGoalsScored(gameid, prevGame, mock = null) {
    let goalsScoredPromise = new Promise((resolve, reject) => {
        if (mock) {
            let goals = extractAllGoalsScored(mock, prevGame);
            resolve(goals);
            return;
        } else {
            nhlApi.GetFromNHLApi("gamecenter/" + gameid + "/landing").then((game) => {
                let goals = extractAllGoalsScored(game, prevGame);
                resolve(goals);
                return;
              }).catch((err) => {
                reject("Error retrieving game data: " + err);
                return;
              });
        }
    });
    return goalsScoredPromise;
  }
  
  
  /**
   * Gets a live update for the game specified by gameid and returns the state of the game as an JSON object
   * @param {String} gameid API internal ID of a NHL Game
   * @returns a Promise that resolves with the state of the game as an JSON object
   */
  function getGameState(gameid, mock = null) {
      let gameStatePromise = new Promise((resolve,reject) => {
        if (mock) {
            let gameState = extractGameState(mock);
            resolve(gameState);
            return;
        } else {
            nhlApi.GetFromNHLApi("gamecenter/" + gameid + "/landing").then((game) => {
                let gameState = extractGameState(game);
                resolve(gameState);
                return;
            }).catch((err) => {
                reject(err);
                return;
            })
        }
      });
      return gameStatePromise;
}

  /**
   * Gets information about game state
   * @param {Object} game API response from the live game endpoint
   * @returns JSON object containing information about game state
   */
  function extractGameState(game) {;
    let homeTeamAPI = game["homeTeam"];
    let awayTeamAPI = game["awayTeam"];
    let homeTeam = {};
    let awayTeam = {};
    homeTeam["abbrev"] = homeTeamAPI["abbrev"];
    homeTeam["goals"] = homeTeamAPI?.["score"] ? homeTeamAPI?.["score"] : 0;
    homeTeam["shots"] = homeTeamAPI?.["sog"] ? homeTeamAPI?.["sog"] : 0;
    homeTeam["powerplay"] = false;
    homeTeam["goaliePulled"] = false;
    awayTeam["abbrev"] = awayTeamAPI["abbrev"];
    awayTeam["goals"] = awayTeamAPI["score"] ? awayTeamAPI["score"] : 0;
    awayTeam["shots"] = awayTeamAPI["sog"] ? awayTeamAPI["sog"] : 0;
    awayTeam["powerplay"] = false;
    awayTeam["goaliePulled"] = false;
    if (game?.["situation"]) {
        let situationObj = game?.["situation"];
        let homeSituation = situationObj?.["homeTeam"]?.["situationDescriptions"];
        let awaySituation = situationObj?.["awayTeam"]?.["situationDescriptions"];
        if (homeSituation) {
            for (let homeSit of homeSituation) {
                if (homeSit == "PP") {
                    homeTeam["powerplay"] = true;
                } else if (homeSit == "EN") {
                    homeTeam["goaliePulled"] = true;
                }
            }
        }
        if (awaySituation) {
            for (let awaySit of awaySituation) {
                if (awaySit == "PP") {
                    awayTeam["powerplay"] = true;
                } else if (awaySit == "EN") {
                    awayTeam["goaliePulled"] = true;
                }
            }
        }
         
    }
    let gameState = {};
    // let periodsArray = game?.["summary"]?.["linescore"]?.["byPeriod"];
    let periodInfo = game?.["periodDescriptor"];
    let period = "1st";
    if (periodInfo != undefined) {
        period = periodInfo?.["number"];
        period = convertPeriodToOrdinal(period,game["shootoutInUse"],game["clock"]["inIntermission"]);
        gameState["period"] = period;
        gameState["periodTimeRemaining"] = game["clock"]["timeRemaining"];
    } else {
        gameState["period"] = "1st";
        gameState["periodTimeRemaining"] = "--";
    }
    gameState["status"] = game["gameState"];
    if (gameState["status"] == "FINAL" || gameState["status"] == "OFF" ) {
        gameState["periodTimeRemaining"] = "FINAL";
        gameState["status"] = "FINAL";
    }
    homeTeam["shootoutGoalsScored"] = null;
    homeTeam["shootoutAttempts"] = null;
    awayTeam["shootoutGoalsScored"] = null;
    awayTeam["shootoutAttempts"] = null;
    if (gameState["period"] === "SO") {
        let shootoutObj = game["summary"]["shootout"];
        let soState = getShootOutState(shootoutObj,homeTeam,awayTeam);
        homeTeam["shootoutGoalsScored"] = soState["homeShootoutScore"];
        homeTeam["shootoutAttempts"] = soState["homeShootoutAttempts"];
        awayTeam["shootoutGoalsScored"] = soState["awayShootoutScore"];
        awayTeam["shootoutAttempts"] = soState["awayShootoutAttempts"];
        
    }
    gameState["home"] = homeTeam;
    gameState["away"] = awayTeam;
    return gameState;
  }

/**
 * Get all goals scored in the game so far
 * @param {Object} game API response from the live game endpoint
 * @returns Array of all goals scored
 */
function extractAllGoalsScored(game,prevGame = null) {
    let goalsByPeriod = game?.["summary"]?.["scoring"];
    let goalsArr = [];
    if (!goalsByPeriod) {
        return [];
    }
    for (let goals of goalsByPeriod) {
        let period = goals["periodDescriptor"]["number"];
        period = convertPeriodToOrdinal(period);
        let goal = goals["goals"];
        for (let g of goal) {
            g["ordinalNum"] = period;
            g["strength"] = convertGoalStrengthToOrdinal(g["strength"]);
        }
        goalsArr = goalsArr.concat(goals["goals"]);
    }
    return goalsArr.reverse();
}


function getShootOutState(shootoutObj, homeTeam, awayTeam) {
    let homeShootoutScore = 0;
    let homeShootoutAttempts = 0;
    let awayShootoutScore = 0;
    let awayShootoutAttempts = 0;
    for (let shootoutAttempt of shootoutObj) {
        if (shootoutAttempt["teamAbbrev"]["default"] == homeTeam["abbrev"]) {
            homeShootoutAttempts = homeShootoutAttempts + 1;
            if (shootoutAttempt["result"] == "goal") {
                homeShootoutScore = homeShootoutScore + 1;
            }
        } else {
            awayShootoutAttempts = awayShootoutAttempts + 1;
            if (shootoutAttempt["result"] == "goal") {
                awayShootoutScore = awayShootoutScore + 1;
            }
        }
    }
    let shootOutState = {
        homeShootoutScore: homeShootoutScore,
        homeShootoutAttempts: homeShootoutAttempts,
        awayShootoutScore: awayShootoutScore,
        awayShootoutAttempts: awayShootoutAttempts 
    }
    return shootOutState;
}

function convertPeriodToOrdinal(period, shootout = true, intermission = false) {
    let periodOrdinal;
    if (intermission) {
        periodOrdinal = "INT";
    } else if (period == 1) {
        periodOrdinal = "1st";
    } else if (period == 2) {
        periodOrdinal = "2nd";
    } else if (period == 3) {
        periodOrdinal = "3rd";
    } else if (period == 4) {
        periodOrdinal = "OT";
    } else if (period > 4) {
        if (shootout) {
            periodOrdinal = "SO";
        } else {
            let otNum = period - 3;
            periodOrdinal = otNum + "OT";
        }
    }
    return periodOrdinal;
}

function convertGoalStrengthToOrdinal(goalStrength) {
    let goalStrengthOrdinal;
    if (goalStrength == "pp") {
        goalStrengthOrdinal = "PPG";
    } else if (goalStrength == "sh") {
        goalStrengthOrdinal = "SHG";
    } else if (goalStrength == "ev") {
        goalStrengthOrdinal = "EVEN";
    }
    return goalStrengthOrdinal;
}

  /**
   * Updates the game state
   * @param {Object} game The game object to be updated
   * @param {Object} mock Mock object of NHL api response. Intended for testing
   * @returns a Promise that resolves with the updated game object
   */
  function updateGameStatus(game, mock = null) {
    let updateGameStatePromise = new Promise((resolve,reject) => {
        let gameId = game["id"];
        getAllGoalsScored(gameId,game,mock).then((goals) => {
            if (game["allGoals"].length != goals.length) {
                game["allGoals"] = goals;
                game["areGoalsUpdated"] = true;
                return getGameState(gameId);
            } else {
                game["allGoals"] = goals;
                game["areGoalsUpdated"] = false;
                return getGameState(gameId);
            }}).then((gameState) => {
                game["currentState"] = gameState;
                // The NHL API does not have an accurate score in the goal object if it is the game winning goal scored in a shootout
                // so this fixes it
                if (game["currentState"]["period"] == "SO" && game["currentState"]["periodTimeRemaining"] == "Final") {
                    let awayGoals = game["currentState"]["away"]["goals"];
                    let homeGoals = game["currentState"]["home"]["goals"];
                    game["allGoals"][0]["about"]["goals"]["away"] = awayGoals;
                    game["allGoals"][0]["about"]["goals"]["home"] = homeGoals;
                }
                resolve(game);
                return;
            }).catch((err) => {
                reject("Game could not be updated due to: " + err);
                return;
            });
        });
    return updateGameStatePromise;
}

  /**
   * Determines the winner of the game
   * @param {Object} game Internal game object
   * @returns JSON object containing information about the game win; type of win, winning team, and final score
   */
  function determineWinner(game) {
    let state = game["currentState"];
    let winnerJSON = {};
    winnerJSON["awayGoals"] = state["away"]["goals"];
    winnerJSON["homeGoals"] = state["home"]["goals"];
    winnerJSON["awayShort"] = game["away"]["abbreviation"];
    winnerJSON["away"] = game["away"]["name"];
    winnerJSON["homeShort"] = game["home"]["abbreviation"];
    winnerJSON["home"] = game["home"]["name"];
    if (state["period"] == "3rd" || state["period"] == "OT") {
        if (state["period"].valueOf() == "3rd") {
            winnerJSON["winType"] = "Regulation";
        } else {
            winnerJSON["winType"] = "Overtime";
        }
        if (state["away"]["goals"] > state["home"]["goals"]) {
            winnerJSON["winnerShort"] = game["away"]["abbreviation"];
            winnerJSON["winner"] = game["away"]["name"];
            winnerJSON["winnerLoc"] = "away"; 

        } else {
            winnerJSON["winnerShort"] = game["home"]["abbreviation"];
            winnerJSON["winner"] = game["home"]["name"];
            winnerJSON["winnerLoc"] = "home";
        }
    } else if (state["period"] == "SO") {
        winnerJSON["winType"] = "Shootout";
        if (state["away"]["shootoutGoalsScored"] > state["home"]["shootoutGoalsScored"]) {
            winnerJSON["winnerShort"] = game["away"]["abbreviation"];
            winnerJSON["winner"] = game["away"]["name"];
            winnerJSON["winnerLoc"] = "away";
        } else {
            winnerJSON["winnerShort"] = game["home"]["abbreviation"];
            winnerJSON["winner"] = game["home"]["name"];
            winnerJSON["winnerLoc"] = "home";
        }
    }
    return winnerJSON;
  } 


module.exports = {
    findGames: findGames,
    createGame: createGame,
    updateGameStatus: updateGameStatus,
    determineWinner: determineWinner
}