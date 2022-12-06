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
  const map1 = new Map([["col1", <img src={require("./assets/logos/Boston Bruins.png")}></img>]
                        ,["col2", "BOS"], ["col3", "@"], ["col4", "VAN"]
                        ,["col5", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>]
                        ,["col6", "7:00PM"]
                      ,["ROWKEYIDENTIFIER", "9-2 LOL"]]);
  
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
      console.log("else");
      setDate(window.localStorage.getItem("date"));
      setGamesList(window.localStorage.getItem("gamesList"));
    }
  },[]);

  // After date state changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('date', date);
  }, [date]);
  
  // After games list changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('gamesList', gamesList); 
  }, [gamesList]);

  return (
    <div className="App">
      <ErrorBoundary>
        <Table 
          rows={[map1]}
          cellClassNames={["class1","class1", "class1", "class1", "class1", "class1"]}
          rowClassNames={["VAN"]}
          />
        {/* <Games gamesData={gamesList}></Games> */}
      </ErrorBoundary>
    </div>
  );
}

export default App;
