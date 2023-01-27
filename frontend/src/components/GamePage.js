import {React,useEffect, useState} from 'react';
import Scoreboard from './Scoreboard';
import {Table} from './Table';
import axios, * as others from 'axios';
import {useParams} from 'react-router-dom';
import '../css/GamePage.css';

export default function GamePage(props) {
    let {id} = useParams();
    const [gameData, setGameData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // On component mount, if props.gameData is not defined, call the API and store the result in local storage
    // .. before rendering it in the component
    useEffect(() => {
        setErrorMessage(null);
        let gameInterval;
        if (!props.gameData) {
            // apiBase is set in local storage from the App component
            let apiBase = window.localStorage.getItem("apiBase");
            // Make post call to local server
            axios.post(apiBase+"/game", {
                gameId: id
              }).then((response) => {
                setGameData(response.data);
                // window.api.invokeNotificationWithSound();
              }).catch((err) => {
                console.log(err);
                setErrorMessage(err);
              })
        } else {
            setGameData(props.gameData);
        }

        if (!gameInterval) {
            gameInterval = setInterval(getGameUpdate,60000);
            console.log("printing");
            console.log(gameInterval);
        }

        return function cleanup() {
            console.log("clearing");
            console.log(gameInterval);
            clearInterval(gameInterval);
        }

    },[]);

    useEffect(() => {
        window.localStorage.setItem('activeGameData',JSON.stringify(gameData));
    },[gameData]);


    function getGameUpdate(gameData) {
        let apiBase = window.localStorage.getItem("apiBase");
        axios.get(apiBase+"/gameUpdate").then((response) => {
            console.log("print interval");
            console.log(response.data);
            setGameData(response.data);
        }).catch((err) => {
            setErrorMessage(err);
        });
    }

    function processGoalsData() {
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
                let score = gameData["away"]["abbreviation"] + ": " + goal["about"]["goals"]["away"] + " | " 
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
        <div className="gamePageContainer">
            <Scoreboard gameData={gameData} onClickHandler={props.onClickHandler}/>
            {gameData
            && <Table
                rows={processGoalsData(gameData)}
                tableClassName={"goalsTable"}
                cellClassNames={[["goalRow goalLogo","goalRow goalDescription","goalRow goalCurrentScore"]]}
                >
                </Table>}
            <button className="button backButton" type="button" onClick={props.onClickHandler}>Return To Home Page</button>
        </div>
        
        
    )
}