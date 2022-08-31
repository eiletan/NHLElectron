const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const game = require('../../js/game.js');
const util = require("../../js/util.js");

describe('Game', function() {
    let regularSchedule;
    let playoffSchedule;

    before(function () {
        let regularSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","scheduleRegular.json"));
        let playoffSchedulePromise = util.retrieveFile(path.join(__dirname, "../","json","schedule","schedulePlayoffs.json"));
        return Promise.all([regularSchedulePromise, playoffSchedulePromise]).then((values) => {
            regularSchedule = values[0];
            playoffSchedule = values[1];
        }).catch((err) => {
            let errStr = "Setup failed: " + err; 
            console.log(errStr);
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
});