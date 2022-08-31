const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const init = require('../../js/init.js');
const util = require("../../js/util.js");
const api = require('../../js/NhlApi.js');


describe("Init", function() {
    let localTeams;
    let apiTeams;
    before(function() {
        localTeamsPromise = util.retrieveFile(path.join(__dirname, "../", "../", "assets", "teams", "teams.json"));
        apiTeamsPromise = api.GetFromNHLApi("/teams");
        return Promise.all([localTeamsPromise,apiTeamsPromise]).then((values) => {
            localTeams = values[0];
            apiTeams = values[1]["teams"];
        }).catch((err) => {
            assert.fail("Setup fail: " + err);
        })
    })

    it("should initialize teams correctly", function() {
        return init.initTeams().then((internalTeams) => {
            let finalKeys = Object.keys(internalTeams);
            // Save copy of localTeams array for use in this test
            let localTeamsCopy = JSON.parse(JSON.stringify(localTeams));
            // The internal teams object should contain a "default" team, which uses the NHL logo
            assert.equal(finalKeys.length-1,apiTeams.length);
            for (apiTeam of apiTeams) {
                let internalTeam = internalTeams[apiTeam["name"]];
                let localTeam;
                for (let i = 0; i < localTeamsCopy.length; i++) {
                    if (localTeamsCopy[i]["name"] === apiTeam["name"]) {
                        localTeam = localTeamsCopy[i];
                        localTeamsCopy.splice(i,1);
                        break;
                    }
                }
                if (!localTeam) {
                    assert.fail(apiTeam["name"] + " was not found in local team file");
                }
                assert.equal(internalTeam["id"], apiTeam["id"]);
                assert.equal(internalTeam["logo"], localTeam["logo"]);
                assert.equal(internalTeam["color"], localTeam["color"]);
                assert.equal(internalTeam["goalHorn"], localTeam["goalHorn"]);
                assert.equal(internalTeam["abbreviation"], apiTeam["abbreviation"]);
                assert.equal(internalTeam["shortName"], apiTeam["shortName"]);
                assert.equal(internalTeam["teamName"], apiTeam["teamName"]);
                let teamKeysLength = Object.keys(internalTeam).length;
                assert.equal(teamKeysLength,8);
            }
            let defaultTeam = internalTeams["NHL"];
            let defaultKeys = Object.keys(defaultTeam);
            assert.equal(defaultKeys.length,4);
            assert.notEqual(defaultKeys.indexOf("color"),-1);
            assert.notEqual(defaultKeys.indexOf("logo"),-1);
            assert.notEqual(defaultKeys.indexOf("goalHorn"),-1);
            assert.notEqual(defaultKeys.indexOf("name"),-1);
        }).catch((err) => {
            assert.fail(err);
        })
    })
})