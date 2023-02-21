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
                let teamName = goal["team"]["name"];
                let logo;
                if (gameData["away"]["name"] == teamName) {
                    logo = gameData["away"]["logo"];
                } else {
                    logo = gameData["home"]["logo"];
                }
                let strength = goal["result"]["strength"]["code"];
                // Strip point totals from the goal description
                let goalDesc = goal["result"]["description"].replace(/ \((.*?)\)/g,"");
                goalDesc = goalDesc + " \n" + goal["about"]["ordinalNum"] + " @ " + goal["about"]["periodTime"]
                + " (" + strength + ")" ;
                let score = gameData["away"]["abbreviation"] + ": " + goal["about"]["goals"]["away"] + "\n" 
                + gameData["home"]["abbreviation"] + ": " + goal["about"]["goals"]["home"];

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
                <Table
                rows={processGoalsData(props.gameData)}
                tableClassName={"goalsTable"}
                cellClassNames={[goalsCellClassNames]}
                >
                </Table>
            }
        </div>
    );
}