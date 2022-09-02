// A collection of functions used to retrieve and process game schedules and game data.
const nhlApi = require('./NhlApi.js');
const util = require('./util.js');

var NOTIFLENGTH = 20000;


/**
 * Find all NHL games occuring on the passed in date
 * @param {String} date Date of the game - Must be in format "YYYY-MM-DD"
 * @returns {Promise} Promise that resolves with the list of games for the date as an array 
 */
function findGames(date) {
    let gamesList = null;
    let scheduledGamesPromise = new Promise((resolve,reject) => {
        nhlApi.GetFromNHLApi("/schedule?date=" + date).then((games) => {
            if (games["dates"].length == 0) {
                let empty = [];
                resolve(empty);
                return;
            } else {
                gamesList = games["dates"][0]["games"];
                resolve(gamesList);
                return;
            }
        }).catch((err) => {
            reject("An error occurred: Games for " + date + " could not be retrieved. Please try again");
            console.log(err);
            return;
        });
    });
    return scheduledGamesPromise;
}

/**
 * Find the NHL game involving the passed in team on the given date
 * @param {String} team Name of the team 
 * @param {String} date Date of the game - Must be in format "YYYY-MM-DD"
 * @returns a Promise that resolves with the NHL game as a JSON object, else an exception is thrown
 */
function findGameForTeam(team, date) {
    let gamePromise = new Promise((resolve,reject) => {
        try {
            findGames(date).then((retgames) => {
                let found = false;
                for (game of retgames) {
                    let awayTeam = game["teams"]["away"]["team"]["name"]
                    let homeTeam = game["teams"]["home"]["team"]["name"]
                    if (util.matchTeamName(awayTeam, team) || util.matchTeamName(homeTeam, team)) {
                        found = true;
                        resolve(game);
                    }
                }
                if (found == false) {
                    reject("Game for " + team + " could not be found. Please try again.");
                }
            }).catch((err) => {
                reject(err);
            });
        } catch (err) {
            throw err;
        }
    });
    return gamePromise;
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
            nhlApi.GetFromNHLApi("/game/" + gameid + "/feed/live/diffPatch?startTimecode=").then((response) => {
                return createGameHelper(gameid, response, teams);
            }).then((gameObj)=> {
                resolve(gameObj);
                return;
            }).catch((err) => {
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
        let gameData = response["gameData"];
        let homeTeam = gameData["teams"]["home"]["name"];
        let awayTeam = gameData["teams"]["away"]["name"];
        let gameObj = {};
        gameObj["season"] = gameData["game"]["season"];
        gameObj["home"] = teams[homeTeam];
        gameObj["away"] = teams[awayTeam];
        gameObj["id"] = gameid;
        gameObj["allGoals"] = goals;
        gameObj["currentState"] = extractGameState(response);
        gameObj["playoffSeries"] = null;
        gameObj["areGoalsUpdated"] = false;
        if (gameData["game"]["type"] == "P") {
            nhlApi.GetFromNHLApi("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=" +  gameData["game"]["season"]).then((response) => {
                let pogame = findPlayoffGame(response, homeTeam, awayTeam);
                gameObj["playoffSeries"] = pogame;
                if (pogame != null) {
                    resolve(gameObj);
                    return;
                } else {
                    throw "Playoff data could not be found for the game. Please try again";
                }
            }).catch((err) => {
                reject(err);
                return;
            });
        } else {
            resolve(gameObj);
            return;
        }
    });
    return createGameHelperPromise;
}

  /**
   * Function which finds playoff information about the given game
   * @param {Object} response API response from the live game endpoint
   * @param {String} teamA Team name of one of the teams
   * @param {String} teamB Team name of the other team
   * @returns JSON object containing the playoff round, game number, and game series status
   */
  function findPlayoffGame(response, teamA, teamB) {
      let rounds = response["rounds"].length;
      for (let i = rounds-1; i >= 0; i--) {
          let seriesnum = response["rounds"][i]["series"].length;
          for (let j = 0; j < seriesnum; j++) {
            let pogame = response["rounds"][i]["series"][j];
            if (pogame["matchupTeams"] != undefined) {
                let respTeamA = pogame["matchupTeams"][0]["team"]["name"];
                let respTeamB = pogame["matchupTeams"][1]["team"]["name"];
                if (util.matchTeamName(respTeamA,teamA)) {
                    if (util.matchTeamName(respTeamB, teamB)) {
                        let round = i+1;
                        let gamenum = pogame["currentGame"]["seriesSummary"]["gameLabel"];
                        let seriesStatus = pogame["currentGame"]["seriesSummary"]["seriesStatusShort"];
                        if (seriesStatus == "") {
                            seriesStatus = "Tied 0-0";
                        }
                        let pogameObj = {};
                        pogameObj["round"] = response["rounds"][i]["names"]["name"];
                        pogameObj["gamenum"] = gamenum;
                        pogameObj["seriesStatus"] = seriesStatus;
                        return pogameObj;
                    }
                } else if (util.matchTeamName(respTeamB,teamA)) {
                    if (util.matchTeamName(respTeamA,teamB)) {
                        let round = i+1;
                        let gamenum = pogame["currentGame"]["seriesSummary"]["gameLabel"];
                        let seriesStatus = pogame["currentGame"]["seriesSummary"]["seriesStatusShort"];
                        if (seriesStatus == "") {
                            seriesStatus = "Tied 0-0";
                        }
                        let pogameObj = {};
                        pogameObj["round"] = response["rounds"][i]["names"]["name"];
                        pogameObj["gamenum"] = gamenum;
                        pogameObj["seriesStatus"] = seriesStatus;
                        return pogameObj;
                    }
                }

            }
          }
      }
      return null;
  }

/**
 * Gets a live update for the game specified by gameid and returns all goals scored in the game at the present moment as an array
 * @param {String} gameid API internal ID of a NHL Game
 * @returns a Promise that resolves with an array that contains all goals scored currently from last to first.
 */
 function getAllGoalsScored(gameid) {
    let goalsScoredPromise = new Promise((resolve, reject) => {
      nhlApi.GetFromNHLApi("/game/" + gameid + "/feed/live/diffPatch?startTimecode=").then((game) => {
          extractAllGoalsScored(game).then((goals) => {
            resolve(goals);
            return;
          });
        })
        .catch((err) => {
          reject("Error retrieving game data: " + err);
          return;
        });
    });
    return goalsScoredPromise;
  }
  
  
  /**
   * Gets a live update for the game specified by gameid and returns the state of the game as an JSON object
   * @param {String} gameid API internal ID of a NHL Game
   * @returns a Promise that resolves with the state of the game as an JSON object
   */
  function getGameState(gameid) {
      let gameStatePromise = new Promise((resolve,reject) => {
          nhlApi.GetFromNHLApi("/game/" + gameid + "/feed/live/diffPatch?startTimecode=").then((game) => {
              let gameState = extractGameState(game);
              resolve(gameState);
              return;
          }).catch((err) => {
              reject(err);
              return;
          })
      });
      return gameStatePromise;
  }

  /**
   * Gets information about game state
   * @param {Object} game API response from the live game endpoint
   * @returns JSON object containing information about game state
   */
  function extractGameState(game) {
    let current = game["liveData"]["linescore"];
    let homeTeamAPI = current["teams"]["home"];
    let awayTeamAPI = current["teams"]["away"];
    let homeTeam = {};
    let awayTeam = {};
    homeTeam["goals"] = homeTeamAPI["goals"];
    homeTeam["shots"] = homeTeamAPI["shotsOnGoal"];
    homeTeam["powerplay"] = homeTeamAPI["powerPlay"];
    homeTeam["goaliePulled"] = homeTeamAPI["goaliePulled"];
    awayTeam["goals"] = awayTeamAPI["goals"];
    awayTeam["shots"] = awayTeamAPI["shotsOnGoal"];
    awayTeam["powerplay"] = awayTeamAPI["powerPlay"];
    awayTeam["goaliePulled"] = awayTeamAPI["goaliePulled"];
    let gameState = {};
    gameState["period"] = current["currentPeriodOrdinal"] ? current["currentPeriodOrdinal"]: null ;
    gameState["periodTimeRemaining"] = current["currentPeriodTimeRemaining"] ? current["currentPeriodTimeRemaining"] : null;
    homeTeam["shootoutGoalsScored"] = null;
    homeTeam["shootoutAttempts"] = null;
    awayTeam["shootoutGoalsScored"] = null;
    awayTeam["shootoutAttempts"] = null;
    if (gameState["period"] === "SO") {
        let homeShootoutScore = current["shootoutInfo"]["home"]["scores"];
        let homeShootoutAttempts = current["shootoutInfo"]["home"]["attempts"];
        let awayShootoutScore = current["shootoutInfo"]["away"]["scores"];
        let awayShootoutAttempts = current["shootoutInfo"]["away"]["attempts"];
        homeTeam["shootoutGoalsScored"] = homeShootoutScore;
        homeTeam["shootoutAttempts"] = homeShootoutAttempts;
        awayTeam["shootoutGoalsScored"] = awayShootoutScore;
        awayTeam["shootoutAttempts"] = awayShootoutAttempts;
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
    gameData = game["liveData"]["plays"]["allPlays"];
    let goals = [];
    if (prevGame) {
        if (prevGame["allGoals"] && (prevGame["allGoals"].length > 0)) {
            // If current game is defined, then there is no need to check every single goal in the API response
            for (let i = gameData.length-1; i >= 0; i--) {
                let gameEvent = gameData[i];
                let gameEventType = gameEvent["result"]["eventTypeId"];
                if (gameEventType.valueOf() === "GOAL") {
                    if (prevGame["allGoals"][0]["about"]["eventId"] == gameEvent["about"]["eventId"]) {
                        // If the first goal found matches the first goal of the internal game state, then merge goals and locally stored goals and return
                        let retGoals = goals.concat(prevGame["allGoals"]);
                        return retGoals;
                    } else {
                        goals.push(gameEvent);
                    }
                } else {
                    goals.push(gameEvent);
                }
            } 
        }
    } else {
        // If game has no goals, push all goal events into the array
        for (let i = gameData.length - 1; i >= 0; i--) {
            let gameEvent = gameData[i];
            let gameEventType = gameEvent["result"]["eventTypeId"];
            if (gameEventType.valueOf() === "GOAL") {
                goals.push(gameEvent);
            }
        }
    }
    return goals;
}

  

  /**
   * Updates the game state
   * @param {Object} game The game object to be updated
   * @returns a Promise that resolves with the updated game object
   */
  function updateGameStatus(game) {
    let updateGameStatePromise = new Promise((resolve,reject) => {
        let gameId = game["id"];
        getAllGoalsScored(gameId).then((goals) => {
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
   * @param {Object} game API response from the live game endpoint
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
    findGameForTeam: findGameForTeam,
    createGame: createGame,
    updateGameStatus: updateGameStatus,
    determineWinner: determineWinner
}