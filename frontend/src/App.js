import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Table from './components/Table';
import * as init from './js/init'; 
const internalTeamData = require('./assets/teams/teams.json');



function App() {
  const [initTeams, setInitTeams] = useState(null);
  const map1 = new Map([["col1", <img src={require("./assets/logos/Boston Bruins.png")}></img>]
                        ,["col2", "BOS"], ["col3", "@"], ["col4", "VAN"]
                        ,["col5", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>]
                        ,["col6", "7:00PM"]
                      ,["ROWKEYIDENTIFIER", "9-2 LOL"]]);
  
  // On component mount, initialize team data                    
  useEffect(() => {
    init.initTeams(internalTeamData).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    })
  },[]);


  return (
    <div className="App">
      <ErrorBoundary>
        <Table 
          rows={[map1]}
          cellClassNames={["class1","class2", "class3", "class4", "class5", "class6"]}
          rowClassNames={["VAN"]}
          />
      </ErrorBoundary>
    </div>
  );
}

export default App;
