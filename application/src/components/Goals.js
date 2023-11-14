import React from 'react';
import {Table} from './Table';
// Component to display a list of goals for the given game

export default function Games(props) {
    const goalsCellClassNames = ["goalRow goalLogo","goalRow goalDescription","goalRow goalCurrentScore"];

    function processGoalsData(gameData) {
        if (gameData?.["allGoals"] && gameData["allGoals"].length > 0) {
            let arrOfMaps = [];
            for (let goal of gameData["allGoals"]) {
                let arrMap = [];
                let teamName = goal["teamAbbrev"];
                let logo;
                if (gameData["away"]["abbreviation"] == teamName) {
                    logo = gameData["away"]["logo"];
                } else {
                    logo = gameData["home"]["logo"];
                }
                let strength = goal["strength"];
                let scorer = `${goal["firstName"]} ${goal["lastName"]}`;
                let goalType = goal["shotType"];
                goalType = goalType.charAt(0).toUpperCase() + goalType.slice(1);
                if (goalType != "Tip-in" || goalType != "Backhand") {
                    goalType = goalType + " shot";
                }
                let assists = [];
                let assistsApi = goal?.["assists"];
                if (assistsApi) {
                    for (let assister of assistsApi) {
                        assists.push(`${assister["firstName"]} ${assister["lastName"]}`);
                    }
                }
                // Construct goal description
                let goalDesc = `${scorer} ${goalType ? "(" + goalType + ")" : ""} \n Assists:`;
                if (assists.length == 0) {
                    goalDesc = goalDesc + " None";
                } else {
                    for (let i = 0; i < assists.length; i++) {
                        if (i == assists.length-1) {
                            goalDesc = goalDesc + " " + assists[i];
                        } else {
                            goalDesc = goalDesc + " " + assists[i] + ",";
                        }  
                    } 
                }
                goalDesc = goalDesc + " \n" + goal["ordinalNum"] + " @ " + goal["timeInPeriod"]
                + " (" + strength + ")" ;
                let score = gameData["away"]["abbreviation"] + ": " + goal["awayScore"] + "\n" 
                + gameData["home"]["abbreviation"] + ": " + goal["homeScore"];

                arrMap.push(["logo", <img className={"goalTeamLogoImg"} src={require('../assets/logos/' + logo)}></img>]);
                arrMap.push(["desc", goalDesc]);
                arrMap.push(["score",score]);
                arrMap.push(["ROWKEYIDENTIFIER",null]);
                arrOfMaps.push(new Map(arrMap));
            }
            return arrOfMaps;
        }
    }


    return (
        <div className="goalsContainer">
            {(props.gameData?.["allGoals"].length > 0) ? 
                <p className="componentText goalListDescriptor">Goal breakdown</p>
                :
                <p className="componentText goalListDescriptor">No goal breakdown available</p>
            }
            {(props.gameData?.["allGoals"].length > 0) &&
                <div className="goalsTableContainer">
                    <Table
                        rows={processGoalsData(props.gameData)}
                        tableClassName={"goalsTable"}
                        cellClassNames={[goalsCellClassNames]}
                    >
                    </Table>
                </div>
                
            }
        </div>
    );
}