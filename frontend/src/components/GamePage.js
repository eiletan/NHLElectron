import {React, useEffect, useState} from 'react';
import Scoreboard from './Scoreboard';
import Goals from './Goals';
import axios, * as others from 'axios';
import {useParams} from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

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