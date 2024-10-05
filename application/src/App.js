import React , {useState, useEffect} from 'react';
import './css/App.css';
import './css/HomePage.css';
import './css/Games.css';
import './css/Table.css';
import './css/Scoreboard.css';
import './css/Goals.css';
import './css/GamePage.css';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { Route, Routes, useNavigate } from "react-router-dom";

const apiBase = "http://localhost:3300"

function App() {
  // STATE VARIABLES SECTION //
  const [errorMessage,setErrorMessage] = useState(null);
  const [date, setDate] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [internalTeams, setInternalTeams] = useState(null);
  // A map which contains information about the teams involved in the current games, indexed by their abbreviations
  const [gamesInfoMap, setGamesInfoMap] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [activeGameTimer, setActiveGameTimer] = useState(null);

  // END OF STATE VARIABLES SECTION //
  
  // OTHER VARIABLES SECTION //
  const navigate = useNavigate();

  // END OF OTHER VARIABLES SECTION //
  

  // EFFECT HOOKS SECTION //
  // On component mount, check date and then refresh list of games if it is outdated                    
  useEffect(() => {
    setErrorMessage(null);
    let today = new Date().toLocaleDateString("en-CA");
    let storedDate = window.localStorage.getItem("date");
    let storedTeams = window.localStorage.getItem("internalTeams");
    let todayActual = new Date(today);
    let gameListUpdateDate;
    if (storedDate == "undefined") {
      gameListUpdateDate = new Date("1999-01-01");
    } else {
      gameListUpdateDate = new Date(storedDate);
    }
    
    // If stored date does not match today, update it and fetch list of games for today and the internal representation of NHL teams 
    if (todayActual.getTime() != gameListUpdateDate.getTime()) {
      let formattedDate = todayActual.toISOString().split("T")[0];
      let games = window.api.getGamesList({date: formattedDate, reset: true});
      let internalTeams = window.api.getInternalTeams();
      games.then((gamesToday) => {
        setGamesList(gamesToday);
      }).catch((err) => {
        setErrorMessage(err);
      })
      internalTeams.then((teams) => {
        setInternalTeams(teams);
      }).catch((err) => {
        setErrorMessage(err);
      });
      setDate(formattedDate);
    } else {
      // If internal teams is not already in application memory, fetch it as well as the games list
      if (storedTeams == "undefined") {
        let formattedDate = todayActual.toISOString().split("T")[0];
        let internalTeams = window.api.getInternalTeams();
        internalTeams.then((teams) => {
          setInternalTeams(teams);
          let gamesList = window.api.getGamesList({date: formattedDate, reset: true});
          return gamesList;
        }).then((gamesList) => {
          setGamesList(gamesList);
        }).catch((err) => {
          console.log("Error initializing data: " + err);
        });
      } else {
        setInternalTeams(JSON.parse(window.localStorage.getItem("internalTeams")));
        setGamesList(JSON.parse(window.localStorage.getItem("gamesList")));
        setGamesInfoMap(JSON.parse(window.localStorage.getItem("gamesInfoMap")));
      }
      setDate(window.localStorage.getItem("date"));      
    }
    window.localStorage.setItem('apiBase',apiBase);
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

  // After active game is set, redirect to scoreboard/game page
  useEffect(() => {
    if (activeGame) {
        navigate("/game/" + activeGame["id"]);
    }
  },[activeGame]);

  // END OF EFFECT HOOKS SECTION //


  // HELPER FUNCTIONS SECTION //
  function createGamesInfoMap(gamesList) {
    if (gamesList && gamesList.length != 0) {
      let map = {};
      for (let game of gamesList) {
        let awayTeam = game["awayTeam"]["fullName"];
        let homeTeam = game["homeTeam"]["fullName"];
        let awayTeamInfo = internalTeams?.[awayTeam];
        let homeTeamInfo = internalTeams?.[homeTeam];
        if (!awayTeamInfo) {
          awayTeamInfo = {
            "name": awayTeam,
            "abbreviation": game["awayTeam"]["abbrev"],
            "color": internalTeams["NHL"]["color"],
            "logo": internalTeams["NHL"]["logo"],
            "goalHorn": internalTeams["NHL"]["goalHorn"],
            "hornLength": internalTeams["NHL"]["hornLength"]
          }
        }

        if (!homeTeamInfo) {
          homeTeamInfo = {
            "name": homeTeam,
            "abbreviation": game["homeTeam"]["abbrev"],
            "color": internalTeams["NHL"]["color"],
            "logo": internalTeams["NHL"]["logo"],
            "goalHorn": internalTeams["NHL"]["goalHorn"],
            "hornLength": internalTeams["NHL"]["hornLength"]
          }
        }
        map[awayTeamInfo["abbreviation"]] = awayTeamInfo;
        map[homeTeamInfo["abbreviation"]] = homeTeamInfo;
      }
      return map;
    }
    return null;
    
  }

  function gamesTableOnClick(event) {
    let gameid = event.currentTarget.id;
    let activeGame = window.api.createGame({id: gameid});
    activeGame.then((game) => {
      setActiveGame(game);
    }).catch((err) => {
      setErrorMessage(err);
    });
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


  function scoreboardBackButtonOnClick() {
    navigate("/");
  }

  function minimizeWindow() {
    window.api.minimizeWindow();
  }

  function maximizeWindow() {
    window.api.maximizeWindow();
  }

  function closeWindow() {
    window.api.closeWindow();
  }

  // END OF HELPER FUNCTIONS SECTION //

  return (
    <div className="App">
      <div className="titlebar">
        <div className="titlebarcircle">
          <button className="titlebarbutton titlebarclose" type="button" onClick={closeWindow}>
            <span className="titlebarcircletext componentText tbc">
              x
            </span>
          </button>
        </div>
        <div className="titlebarcircle">
          <button className="titlebarbutton titlebarmaximize" type="button" onClick={maximizeWindow}>
            <span className="titlebarcircletext componentText tbmax">
              o
            </span>
          </button>
        </div>
        <div className="titlebarcircle">
          <button className="titlebarbutton titlebarminimize" type="button" onClick={minimizeWindow}>
            <span className="titlebarcircletext componentText tbmin">
              -
            </span>
          </button>
        </div>
      </div>
      <ErrorBoundary onClickHandler={scoreboardBackButtonOnClick}>
      <div className="componentText errorMessage">{errorMessage}</div>
        <Routes>
            <Route path="/" element={<HomePage gamesData={gamesList} date={date} internalTeams={internalTeams} onClickHandler={gamesTableOnClick} onHoverHandler={[gamesOnMouseEnter, gamesOnMouseLeave]}></HomePage>}/>
            <Route path="/game/:id" element={<GamePage gameData={activeGame} onClickHandler={scoreboardBackButtonOnClick}/>}/>
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
