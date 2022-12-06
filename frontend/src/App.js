import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import * as util from './util/util'
import ErrorBoundary from './components/ErrorBoundary';
import Games from './components/Games';
import Table from './components/Table';
import axios, * as others from 'axios';


function App() {
  const [errorMessage,setErrorMessage] = useState(null);
  const [date, setDate] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [internalTeams, setInternalTeams] = useState(null); 

  
  // On component mount, check date and then refresh list of games if it is outdated                    
  useEffect(() => {
    let today = new Date().toLocaleDateString("en-CA");
    let gameListUpdateDate = new Date(window.localStorage.getItem("date"));
    let todayActual = new Date(today);
    // If stored date does not match today, update it and fetch list of games for today and the internal representation of NHL teams 
    if (todayActual.getTime() != gameListUpdateDate.getTime()) {
      axios.all([axios.get('http://localhost:3300/games?date=' + today),axios.get('http://localhost:3300/internalTeams')]).then(
        axios.spread((gamesListResponse,internalTeamsResponse) => {
          setGamesList(gamesListResponse.data);
          setDate(String(today));
          setInternalTeams(internalTeamsResponse.data);
        })
      ).catch((err) => {
        setErrorMessage(err.response.data.errorMessage);
      })
    } else {
      setDate(window.localStorage.getItem("date"));
      setGamesList(JSON.parse(window.localStorage.getItem("gamesList")));
      setInternalTeams(JSON.parse(window.localStorage.getItem("internalTeams")));
    }
  },[]);

  // After date state changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('date', date);
  }, [date]);
  
  // After games list changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('gamesList', JSON.stringify(gamesList)); 
  }, [gamesList]);

    // After internal team list changes, store it to local storage
    useEffect(() => {
      window.localStorage.setItem('internalTeams', JSON.stringify(internalTeams)); 
    }, [internalTeams]);

  return (
    <div className="App">
      <ErrorBoundary>
        <Games gamesData={gamesList} internalTeams={internalTeams}></Games>
      </ErrorBoundary>
    </div>
  );
}

export default App;
