import React from 'react';
import Table from './Table';

export default function Scoreboard(props) {
    const scoreboardStatusClassNames = ["gameScoreBoardStatusInfo awayTeamShotsOnGoal", "gameScoreBoardStatusInfo awayTeamStrength",
                                    "gameScoreBoardStatusInfo gameTime", "gameScoreBoardStatusInfo gamePeriod",
                                    "gameScoreBoardStatusInfo awayTeamStrength", "gameScoreBoardStatusInfo homeTeamShotsOnGoal"];
    const scoreboardClassNames = ["gameScoreBoardInfo teamScoreboardLogo awayTeamScoreboardLogo", "gameScoreBoardInfo awayTeamScoreboardAbbr",
                                  "gameScoreBoardInfo awayTeamScoreboardGoals", "gameScoreBoardInfo homeTeamScoreboardGoals",
                                  "gameScoreBoardInfo awayTeamScoreboardAbbr", "gameScoreBoardInfo teamScoreboardLogo awayTeamScoreboardLogo"];
    
    function processGameDataForScoreboard(gameData) {
        let gameState = gameData["currentState"];

        let away = gameData["away"]["abbreviation"];
        let awayColor = gameData["away"]["color"];
        let awayGoals = gameState["away"]["goals"];
        let awayLogo = gameData["away"]["logo"];

        let home = gameData["home"]["abbreviation"];
        let homeColor = gameData["home"]["color"];
        let homeGoals = gameState["home"]["goals"];
        let homeLogo = gameData["home"]["logo"];

        let arrMap = [];
        arrMap.push(["awayLogo",<img src={require('../assets/logos/' + awayLogo)}></img>]);
        arrMap.push(["awayAbbr", away]);
        arrMap.push(["awayGoals", awayGoals]);
        arrMap.push(["homeGoals", homeGoals]);
        arrMap.push(["homeAbbr", home]);
        arrMap.push(["homeLogo",<img src={require('../assets/logos/' + homeLogo)}></img>]);
        arrMap.push(["ROWKEYIDENTIFIER", null]);
        let map = new Map(arrMap);
        return map;
    }

    function processGameStatusForScoreboard(gameData) {
        let gameState = gameData["currentState"];
        let arrMap = [];
        
        let awaySOG = gameState?.["away"]?.["shots"] ? gameState?.["away"]?.["shots"] : 0;
        let homeSOG = gameState?.["home"]?.["shots"] ? gameState?.["home"]?.["shots"] : 0;
        let awaySO = null; 
        let homeSO = null;
        
        if (gameState["period"] != undefined && gameState["period"].valueOf() == "SO") {
            awaySO = gameState["away"]["shootoutGoalsScored"] + "/" + gameState["away"]["shootoutAttempts"];
            homeSO = gameState["home"]["shootoutGoalsScored"] + "/" + gameState["home"]["shootoutAttempts"];
        }

        let awayPowerplay = gameState?.["away"]?.["powerplay"] ? gameState?.["away"]?.["powerplay"] : false;
        let homePowerplay = gameState?.["home"]?.["powerplay"] ? gameState?.["home"]?.["powerplay"] : false;

        let awayGoaliePulled = gameState?.["away"]?.["goaliePulled"] ? gameState?.["away"]?.["goaliePulled"] : false;
        let homeGoaliePulled = gameState?.["home"]?.["goaliePulled"] ? gameState?.["home"]?.["goaliePulled"] : false;

        let periodTime = gameState?.["periodTimeRemaining"] ? gameState?.["periodTimeRemaining"] : "SCHEDULED";
        let gamePeriod = gameState?.["period"] ? gameState?.["period"] : "1st";
        
        if (awaySO) {
            arrMap.push(["awaySOG", "SOG: " + awaySOG + "\n" + "SO: " + awaySO]);
        } else {
            arrMap.push(["awaySOG","SOG: " + awaySOG]);
        }
        
        if (awayPowerplay) {
            if (awayGoaliePulled) {
                arrMap.push(["awayStrength", "PP\nEN"]);
            } else {
                arrMap.push(["awayStrength", "PP"]);
            }
        } else if (awayGoaliePulled) {
            arrMap.push(["awayStrength", "EN"]);
        } else {
            arrMap.push(["awayStrength", ""]);
        }

        arrMap.push(["periodTime", periodTime]);
        arrMap.push(["period", gamePeriod]);

        if (homePowerplay) {
            if (homeGoaliePulled) {
                arrMap.push(["homeStrength", "PP\nEN"]);
            } else {
                arrMap.push(["homeStrength", "PP"]);
            }
        } else if (homeGoaliePulled) {
            arrMap.push(["homeStrength", "EN"]);
        } else {
            arrMap.push(["homeStrength", ""]);
        }

        if (homeSO) {
            arrMap.push(["homeSOG", "SOG: " + homeSOG + "\n" + "SO: " + homeSO]);
        } else {
            arrMap.push(["homeSOG","SOG: " + homeSOG]);
        }
        
        
        arrMap.push(["ROWKEYIDENTIFIER", null]);
        let map = new Map(arrMap);
        return map;

    }

    return (
        <React.Fragment>
            <Table
                rows={[processGameStatusForScoreboard(props.gameData),processGameDataForScoreboard(props.gameData)]}
                tableClassName={"gameScoreBoardTable"}
                cellClassNames={[scoreboardStatusClassNames,scoreboardClassNames]}
                rowClassNames={["gameScoreBoardStatusInfoRow","gameScoreBoardRow"]}
            >
            </Table>
        </React.Fragment>
        
    );
}