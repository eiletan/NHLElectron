const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const game = require('../../js/game.js');
const util = require("../../js/util.js");
const init = require("../../js/init.js");

describe('Game', function() {
    let regularSchedule;
    let playoffSchedule;
    let regularGameBeforeMockResponse;
    let regularGameBefore;
    let regularGameAfter;
    let playoffGame;
    let internalTeams;

    before(function () {
        let regularSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","scheduleRegular.json"));
        let playoffSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","schedulePlayoffs.json"));
        let regularGameBeforeMockPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameBeforeMockResponse.json"));
        let regularGameBeforePromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameBefore.json"));
        let regularGameAfterPromise = util.retrieveFile(path.join(__dirname, "../","json","game","regularGameAfter.json"));
        let playoffGamePromise = util.retrieveFile(path.join(__dirname, "../","json","game","playoffGame.json"));
        let internalTeamsPromise = init.initTeams();
        let promArr = [regularSchedulePromise, playoffSchedulePromise, regularGameAfterPromise, playoffGamePromise, internalTeamsPromise,
            regularGameBeforeMockPromise, regularGameBeforePromise];
        return Promise.all(promArr).then((values) => {
            regularSchedule = values[0];
            playoffSchedule = values[1];
            regularGameAfter = values[2];
            playoffGame = values[3];
            internalTeams = values[4];
            regularGameBeforeMockResponse = values[5];
            regularGameBefore = values[6];
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

    it('should create regular season game', function() {
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


});