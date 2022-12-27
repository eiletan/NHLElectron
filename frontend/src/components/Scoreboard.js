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
        // arrMap.push(["awayAbbr", ""]);
        
    }

    return (
        <React.Fragment>
            <Table>

            </Table>
            <Table>

            </Table>
        </React.Fragment>
        
    );
}