import {React,useRef,useEffect, useState} from 'react';
import {Table} from './Table';

export default function Scoreboard(props) {
    const scoreboardPlayoffsClassNames = ["playoffSeriesInfo"];
    const scoreboardStatusClassNames = ["gameScoreBoardStatusInfo awayTeamShotsOnGoal", "gameScoreBoardStatusInfo awayTeamStrength",
                                    "gameScoreBoardStatusInfo gameTime", "gameScoreBoardStatusInfo gamePeriod",
                                    "gameScoreBoardStatusInfo homeTeamStrength", "gameScoreBoardStatusInfo homeTeamShotsOnGoal"];
    const scoreboardClassNames = ["gameScoreBoardInfo teamScoreboardLogo awayTeamScoreboardLogo", "gameScoreBoardInfo gameScoreBoardInfoAbbr awayTeamScoreboardAbbr",
                                  "gameScoreBoardInfo gameScoreBoardInfoGoals awayTeamScoreboardGoals", "gameScoreBoardInfo gameScoreBoardInfoGoals homeTeamScoreboardGoals",
                                  "gameScoreBoardInfo gameScoreBoardInfoAbbr homeTeamScoreboardAbbr", "gameScoreBoardInfo teamScoreboardLogo homeTeamScoreboardLogo"];
    const containerRef = useRef(null);

    // This hook colors the team abbreviation on the scoreboard each time the game data gets updated 
    useEffect(() => {
        if (containerRef?.current && props.gameData) {
            let awayAbbrElement = containerRef.current.getElementsByClassName("awayTeamScoreboardAbbr")[0];
            let homeAbbrElement = containerRef.current.getElementsByClassName("homeTeamScoreboardAbbr")[0]; 
            awayAbbrElement.style.backgroundColor = props.gameData["away"]["color"];
            homeAbbrElement.style.backgroundColor = props.gameData["home"]["color"];
        }
    },[props.gameData]);



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
        arrMap.push(["awayLogo",<img className={"scoreboardLogoImg"} src={require('../assets/logos/' + awayLogo)}></img>]);
        arrMap.push(["awayAbbr", away]);
        arrMap.push(["awayGoals", awayGoals]);
        arrMap.push(["homeGoals", homeGoals]);
        arrMap.push(["homeAbbr", home]);
        arrMap.push(["homeLogo",<img className={"scoreboardLogoImg"} src={require('../assets/logos/' + homeLogo)}></img>]);
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

        let periodTime = gameState?.["periodTimeRemaining"] ? gameState?.["periodTimeRemaining"] : "--";
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


    function processGameDataForPlayoffs(gameData) {
        let playoffSeries = gameData["playoffSeries"] 
        if (playoffSeries) {
            let arrMap = [];
            let playoffInfo = playoffSeries["round"] + " | " + playoffSeries["gamenum"] + " | " + playoffSeries["seriesStatus"];
            arrMap.push(["playoffInfo", playoffInfo],["ROWKEYIDENTIFIER", null]);
            return new Map(arrMap);
        } else {
            return null;
        }   
    }

    return (
        <div className={"scoreboardContainer"}>
            {props.gameData && processGameDataForPlayoffs(props.gameData)
            && <Table
                    rows={[processGameDataForPlayoffs(props.gameData)]}
                    tableClassName={"gameScoreBoardTable"}
                    cellClassNames={[scoreboardPlayoffsClassNames]}
                    rowClassNames={["gameScoreboardStatusPlayoffInfoRow"]}
                >
                </Table>}
            {props.gameData && <Table
                rows={[processGameStatusForScoreboard(props.gameData),processGameDataForScoreboard(props.gameData)]}
                tableClassName={"gameScoreBoardTable"}
                cellClassNames={[scoreboardStatusClassNames,scoreboardClassNames]}
                rowClassNames={["gameScoreBoardStatusInfoRow","gameScoreBoardRow"]}
                ref={containerRef}
            >
            </Table>}
            <button className="button backButton" type="button" onClick={props.onClickHandler}>Return To Home Page</button>
        </div>
        
    );
}