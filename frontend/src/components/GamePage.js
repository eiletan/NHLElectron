import {React,useEffect, useState} from 'react';
import Scoreboard from './Scoreboard';
import axios, * as others from 'axios';

export default function GamePage(props) {

    const [gameData, setGameData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // On component mount, if props.gameData is not defined, call the API and store the result in local storage
    // .. before rendering it in the component
    useEffect(() => {
        setErrorMessage(null);
        if (!props.gameData) {
            let game = JSON.parse(window.localStorage.getItem("activeGameData"));
            let gameId = game["id"];
            // apiBase is set in local storage from the App component
            let apiBase = window.localStorage.getItem("apiBase");
            // Make post call to local server
            axios.post(apiBase+"/game", {
                gameId: gameId
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
    },[]);

    useEffect(() => {
        window.localStorage.setItem('activeGameData',JSON.stringify(gameData));
    },[gameData]);


    return (
        <Scoreboard gameData={gameData} onClickHandler={props.onClickHandler}/>
    )
}