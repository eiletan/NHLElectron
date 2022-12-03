import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import * as util from './util/util'
import ErrorBoundary from './components/ErrorBoundary';
import Table from './components/Table';



function App() {
  const [date, setDate] = useState(null);
  const [gamesList, setGamesList] = useState(null); 
  const map1 = new Map([["col1", <img src={require("./assets/logos/Boston Bruins.png")}></img>]
                        ,["col2", "BOS"], ["col3", "@"], ["col4", "VAN"]
                        ,["col5", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>]
                        ,["col6", "7:00PM"]
                      ,["ROWKEYIDENTIFIER", "9-2 LOL"]]);
  
  // On component mount, check date and then refresh list of games if it is outdated                    
  useEffect(() => {
    let today = new Date().toLocaleDateString("en-CA",{timeZone: "America/Los_Angeles"});
    let gameListUpdateDate = new Date(window.localStorage.getItem("date"));
    let todayActual = new Date(today);
    // If stored date does not match today, update it and fetch list of games for today 
    if (todayActual.getTime() != gameListUpdateDate.getTime()) {
      setDate(String(today));
      console.log(today);
    } else {
      console.log("else");
      console.log(window.localStorage.getItem("date"));
    }
  },[]);

  // After date state changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('date', date);
  }, [date]);
  

  return (
    <div className="App">
      <ErrorBoundary>
        <Table 
          rows={[map1]}
          cellClassNames={["class1","class1", "class1", "class1", "class1", "class1"]}
          rowClassNames={["VAN"]}
          />
      </ErrorBoundary>
    </div>
  );
}

export default App;
