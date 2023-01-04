import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import './css/Games.css';
import './css/Table.css';
import './css/Scoreboard.css';
import * as util from './util/util'
import ErrorBoundary from './components/ErrorBoundary';
import Games from './components/Games';
import Table from './components/Table';
import axios, * as others from 'axios';
import Scoreboard from './components/Scoreboard';

function App() {
  const [errorMessage,setErrorMessage] = useState(null);
  const [date, setDate] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [internalTeams, setInternalTeams] = useState(null);
  // A map which contains information about the teams involved in the current games, indexed by their abbreviations
  const [gamesInfoMap, setGamesInfoMap] = useState(null);
  

  
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
      setGamesInfoMap(JSON.parse(window.localStorage.getItem("gamesInfoMap")));
      console.log(JSON.parse(window.localStorage.getItem("gamesInfoMap")));
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

  // After both games list and internal team list changes, update the gamesInfoMap
  useEffect(() => {
    let map = createGamesInfoMap(gamesList);
    if (map) {
      setGamesInfoMap(map);
    }
  }, [gamesList,internalTeams])

  // After gamesInfoMap changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('gamesInfoMap', JSON.stringify(gamesInfoMap)); 
  }, [gamesInfoMap]);

  
  function createGamesInfoMap(gamesList) {
    if (gamesList && gamesList.length != 0) {
      let map = {};
      for (let game of gamesList) {
        let awayTeam = game["teams"]["away"]["team"]["name"];
        let homeTeam = game["teams"]["home"]["team"]["name"];
        let awayTeamInfo = internalTeams[awayTeam];
        let homeTeamInfo = internalTeams[homeTeam];
        map[awayTeamInfo["abbreviation"]] = awayTeamInfo;
        map[homeTeamInfo["abbreviation"]] = homeTeamInfo;
      }
      return map;
    }
    return null;
    
  }

  function gamesTableOnClick(event) {
    let gameid = event.currentTarget.id;
    axios.post("http://localhost:3300/game", {
      gameId: gameid
    }).then((response) => {
      console.log(response.data);
    }).catch((err) => {
      setErrorMessage(err);
    })
  }

  /**
   * On hover, change row color to match home team's primary color
   * @param {*} event 
   */
  function gamesOnMouseEnter(event) {
    let rowElements = event.currentTarget.children;
    let abbr = "";
    for (let rowEl of rowElements) {
      if (rowEl.className.search("homeTeamAbbr") != -1) {
        abbr = rowEl.textContent;
        break;
      }
    }
    event.currentTarget.style.backgroundColor = gamesInfoMap[abbr]["color"];
  }

  /**
   * On exit hover, change row color to default NHL gray
   * @param {*} event 
   */
  function gamesOnMouseLeave(event) {
    event.currentTarget.style.backgroundColor = internalTeams["NHL"]["color"];
  }

  return (
    <div className="App">
      <ErrorBoundary>
        <Games gamesData={gamesList} date={date} internalTeams={internalTeams} onClickHandler={gamesTableOnClick} onHoverHandler={[gamesOnMouseEnter, gamesOnMouseLeave]}></Games>
        
      </ErrorBoundary>
    </div>
  );
}

export default App;
