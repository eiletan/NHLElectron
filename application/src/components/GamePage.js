import {React, useEffect, useState, useRef} from 'react';
import Scoreboard from './Scoreboard';
import Goals from './Goals';
import {useParams} from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import * as util from '../util/util';

export default function GamePage(props) {
    let {id} = useParams();
    const [gameData, setGameData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const intervalRef = useRef();

    // On component mount, if props.gameData is not defined, call the API and store the result in local storage
    // .. before rendering it in the component
    useEffect(() => {
        setErrorMessage(null);
        if (!props.gameData) {
            // apiBase is set in local storage from the App component
            let game = window.api.createGame({id: id});
            game.then((gameRes) => {
                setGameData(gameRes);
            }).catch((err) => {
                setErrorMessage(err);
            });
        } else {
            setGameData(props.gameData);
        }

        if (!intervalRef.current) {
            intervalRef.current = setInterval(getGameUpdate,60000);
        }


        return function cleanup() {
            stopInterval();
            let args = {"stop": true}
            window.api.invokeNotificationWithSound(args);
        }

    },[]);


    useEffect(() => {
        window.localStorage.setItem('activeGameData',JSON.stringify(gameData));
        if (gameData?.["currentState"]?.["periodTimeRemaining"] == "Final") {
            stopInterval();
            let winner = util.determineWinner(gameData);
            let winnerTitle = winner["winnerShort"] + " win in " + winner["winType"] + "!";
            let winnerMsg = winner["awayShort"] + ": " + winner["awayGoals"] + "\n" + winner["homeShort"] + ": " + winner["homeGoals"];
            let teamObj = gameData[winner["winnerLoc"]];
            let logo = teamObj["logo"];
            let goalHorn = teamObj["goalHorn"];
            let duration = teamObj["hornLength"];
            let args = {
                "title": winnerTitle,
                "msg": winnerMsg,
                "audio": goalHorn,
                "length": duration,
                "logo": logo,
                "volume": 0.6
            };
            window.api.invokeNotificationWithSound(args);
        } else if (gameData?.["areGoalsUpdated"]) {
            // This handles the edge case where the first goal can be called back, resulting in areGoalsUpdated being true but
            // no goals are actually present in the array 
            if (gameData["allGoals"].length != 0) {
                // If a new goal is detected, send message to display notification and play audio
                let goalObj = gameData["allGoals"][0];
                // Get the team who scored the goal
                let team = goalObj["team"]["name"];
                // Get goal information for notification
                let goalTitle = gameData["away"]["abbreviation"] + ": " + goalObj["about"]["goals"]["away"] + " | " + gameData["home"]["abbreviation"] + ": " + goalObj["about"]["goals"]["home"]
                + " (" + goalObj["team"]["triCode"] + " GOAL)";
                let goalMsg = goalObj["about"]["ordinalNum"] + " @ " + goalObj["about"]["periodTime"] + " (" + goalObj["result"]["strength"]["code"] + ")"
                // Get the object containing team data
                let teamObj = gameData["away"]["name"] == team ? gameData["away"] : gameData["home"];
                let goalHorn = teamObj["goalHorn"];
                let duration = 20000;
                let logo = teamObj["logo"];
                let args = {
                    "title": goalTitle,
                    "msg": goalMsg,
                    "audio": goalHorn,
                    "length": duration,
                    "logo": logo,
                    "volume": 0.6
                };
                window.api.invokeNotificationWithSound(args);
            }
        }
    },[gameData]);


    function getGameUpdate() {
        let gameUpdate = window.api.updateGame({id: id});
        gameUpdate.then((gameUpdateRes) => {
            setGameData(gameUpdateRes);
        }).catch((err) => {
            setErrorMessage(err);
        });
    }

    function stopInterval() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }



    return (
        <div className="gamePageContainer">
            <ErrorBoundary>
                <Scoreboard gameData={gameData} onClickHandler={props.onClickHandler}/>
                <Goals gameData={gameData}/>
            </ErrorBoundary>
            <div className="buttonDiv">
                <button className="button backButton" type="button" onClick={props.onClickHandler}>
                    <span className="componentText buttonText">Return To Home Page</span>
                </button>
            </div>
            
        </div>
        
        
    )
}