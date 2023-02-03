const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const game = require('../../controller/game.js');
const util = require("../../controller/util.js");
const init = require("../../controller/init.js");

describe('Game', function() {
    let regularSchedule;
    let playoffSchedule;
    let regularGameBeforeMockResponse;
    let regularGameBefore;
    let regularGameDuringMockResponse;
    let regularGameDuringMockResponseZero;
    let regularGameDuring;
    let regularGameDuringZero;
    let regularGameAfter;
    let playoffGame;
    let internalTeams;

    before(function () {
        console.log(typeof path.join(__dirname, "../","json","schedule","scheduleRegular.json"));
        let regularSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","scheduleRegular.json"));
        let playoffSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","schedulePlayoffs.json"));
        let regularGameBeforeMockPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameBeforeMockResponse.json"));
        let regularGameBeforePromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameBefore.json"));
        let regularGameDuringMockPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameDuringMockResponse.json"));
        let regularGameDuringMockZeroPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameDuringMockResponseZero.json"));
        let regularGameDuringPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameDuring.json"));
        let regularGameDuringZeroPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameDuringZero.json"));
        let regularGameAfterPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameAfter.json"));
        let playoffGamePromise = util.retrieveFile(path.join(__dirname, "../","json","game","playoffGame.json"));
        let internalTeamsPromise = init.initTeams(path.join(__dirname,"../","../","json","teams.json"));
        let promArr = [regularSchedulePromise, playoffSchedulePromise, regularGameAfterPromise, playoffGamePromise, internalTeamsPromise,
            regularGameBeforeMockPromise, regularGameBeforePromise, regularGameDuringPromise, regularGameDuringMockPromise, regularGameDuringMockZeroPromise
            ,regularGameDuringZeroPromise];
        return Promise.all(promArr).then((values) => {
            regularSchedule = values[0];
            playoffSchedule = values[1];
            regularGameAfter = values[2];
            playoffGame = values[3];
            internalTeams = values[4];
            regularGameBeforeMockResponse = values[5];
            regularGameBefore = values[6];
            regularGameDuring = values[7];
            regularGameDuringMockResponse = values[8];
            regularGameDuringMockResponseZero = values[9];
            regularGameDuringZero = values[10];
        }).catch((err) => {
            let errStr = "Setup failed: " + err; 
            assert.fail(errStr);
        })
    });


    it('should return regular season schedule for 2021-04-20', function () {
        return game.findGames("2021-04-20").then((games) => {
            
            assert.deepEqual(games,regularSchedule);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return playoff schedule for 2022-05-04', function () {
        return game.findGames("2022-05-04").then((games) => {
            assert.deepEqual(games,playoffSchedule);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return empty schedule for 2022-08-03', function () {
        return game.findGames("2022-08-03").then((games) => {
            
            assert.deepEqual(games,[]);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should create regular season game before game start', function () {
        return game.createGame("2022020010",internalTeams,regularGameBeforeMockResponse).then((game) => {
            assert.deepEqual(game,regularGameBefore);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should create regular season game during the game', function() {
        // 2020020710 is the id of a regular season game from 2021-04-20, the game will be created with a modified response from the NHL API to simulate it being in progress
        return game.createGame("2020020710",internalTeams, regularGameDuringMockResponse).then((game) => {
            assert.deepEqual(game,regularGameDuring);
        }).catch((err) => {
            assert.fail(err);
        });
    });

    it('should create regular season game after game end', function() {
        // 2020020710 is the id of a regular season game from 2021-04-20
        return game.createGame("2020020710",internalTeams).then((game) => {
            assert.deepEqual(game,regularGameAfter);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should create playoff game', function() {
        // 2021030412 is the id of a playoff game from 2022-06-19
        return game.createGame("2021030412",internalTeams).then((game) => {
            assert.deepEqual(game,playoffGame);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should update game', function() {
        // 2020020710 is the id of a regular season game from 2021-04-20, the game will be created with a modified response from the NHL API to simulate it being in progress
        return game.createGame("2020020710",internalTeams, regularGameDuringMockResponse).then((gameToUpdate) => {
            assert.deepEqual(gameToUpdate,regularGameDuring);
            return game.updateGameStatus(gameToUpdate);
        }).then((finalGame) => {
            let updatedGame = JSON.parse(JSON.stringify(regularGameAfter));
            updatedGame["areGoalsUpdated"] = true;
            assert.deepEqual(finalGame,updatedGame);
        }).catch((err) => {
            assert.fail(err);
        });
    });

    it('should update game when first goal is scored', function() {
        // 2020020710 is the id of a regular season game from 2021-04-20, the game will be created with a modified response from the NHL API to simulate it being in progress
        return game.createGame("2020020710",internalTeams, regularGameDuringMockResponseZero).then((gameToUpdate) => {
            assert.deepEqual(gameToUpdate,regularGameDuringZero);
            return game.updateGameStatus(gameToUpdate);
        }).then((finalGame) => {
            let updatedGame = JSON.parse(JSON.stringify(regularGameAfter));
            updatedGame["areGoalsUpdated"] = true;
            assert.deepEqual(finalGame,updatedGame);
        }).catch((err) => {
            assert.fail(err);
        });
    });


    it('should return home team winner in regulation', function() {
        let winnerObj = game.determineWinner(regularGameAfter);
        let actual = {
            "awayGoals": 3,
            "homeGoals": 6,
            "awayShort": "TOR",
            "homeShort": "VAN",
            "home": "Vancouver Canucks",
            "away": "Toronto Maple Leafs",
            "winType": "Regulation",
            "winnerShort": "VAN",
            "winner": "Vancouver Canucks",
            "winnerLoc": "home"
        };
        assert.deepEqual(winnerObj,actual);
    });


    it('should return away team winner in regulation', function() {
        return game.createGame("2021021126",internalTeams).then((createdGame) => {
            let winnerObj = game.determineWinner(createdGame);
            let actual = {
                "awayGoals": 5,
                "homeGoals": 1,
                "awayShort": "VAN",
                "homeShort": "VGK",
                "home": "Vegas Golden Knights",
                "away": "Vancouver Canucks",
                "winType": "Regulation",
                "winnerShort": "VAN",
                "winner": "Vancouver Canucks",
                "winnerLoc": "away"
            };
            assert.deepEqual(winnerObj,actual);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return home team winner in overtime', function() {
        return game.createGame("2021020141",internalTeams).then((createdGame) => {
            let winnerObj = game.determineWinner(createdGame);
            let actual = {
                "awayGoals": 2,
                "homeGoals": 3,
                "awayShort": "NYR",
                "homeShort": "VAN",
                "home": "Vancouver Canucks",
                "away": "New York Rangers",
                "winType": "Overtime",
                "winnerShort": "VAN",
                "winner": "Vancouver Canucks",
                "winnerLoc": "home"
            };
            assert.deepEqual(winnerObj,actual);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return away team winner in overtime', function() {
        return game.createGame("2021020550",internalTeams).then((createdGame) => {
            let winnerObj = game.determineWinner(createdGame);
            let actual = {
                "awayGoals": 2,
                "homeGoals": 1,
                "awayShort": "VAN",
                "homeShort": "ANA",
                "home": "Anaheim Ducks",
                "away": "Vancouver Canucks",
                "winType": "Overtime",
                "winnerShort": "VAN",
                "winner": "Vancouver Canucks",
                "winnerLoc": "away"
            };
            assert.deepEqual(winnerObj,actual);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return home team winner in shootout', function() {
        return game.createGame("2021020400",internalTeams).then((createdGame) => {
            let winnerObj = game.determineWinner(createdGame);
            let actual = {
                "awayGoals": 1,
                "homeGoals": 2,
                "awayShort": "BOS",
                "homeShort": "VAN",
                "home": "Vancouver Canucks",
                "away": "Boston Bruins",
                "winType": "Shootout",
                "winnerShort": "VAN",
                "winner": "Vancouver Canucks",
                "winnerLoc": "home"
            };
            assert.deepEqual(winnerObj,actual);
        }).catch((err) => {
            assert.fail(err);
        })
    });

    it('should return away team winner in shootout', function() {
        return game.createGame("2021021269",internalTeams).then((createdGame) => {
            let winnerObj = game.determineWinner(createdGame);
            let actual = {
                "awayGoals": 5,
                "homeGoals": 4,
                "awayShort": "SJS",
                "homeShort": "VGK",
                "home": "Vegas Golden Knights",
                "away": "San Jose Sharks",
                "winType": "Shootout",
                "winnerShort": "SJS",
                "winner": "San Jose Sharks",
                "winnerLoc": "away"
            };
            assert.deepEqual(winnerObj,actual);
        }).catch((err) => {
            assert.fail(err);
        })
    });


});