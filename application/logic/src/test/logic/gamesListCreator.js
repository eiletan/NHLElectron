const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const game = require('../../controller/game.js');
const util = require("../../controller/util.js");
const api = require('../../controller/NhlApi.js');

// Not really a test, just a script to generate a internal games list for testing use.
describe("Init", function() {
    before(function() {
        
    })

    it("should initialize games list", function() {
        let date = '2025-09-25';
        return game.findGames(date).then((games) => {
            console.log(JSON.stringify(games));
        }).catch((err) => {
            assert.fail(err);
        });  
    })
})