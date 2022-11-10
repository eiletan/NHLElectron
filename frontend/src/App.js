import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Table from './components/Table';



function App() {
  const [initTeams, setInitTeams] = useState(null);
  const map1 = new Map([["col1", <img src={require("./assets/logos/Boston Bruins.png")}></img>]
                        ,["col2", "BOS"], ["col3", "@"], ["col4", "VAN"]
                        ,["col5", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>]
                        ,["col6", "7:00PM"]
                      ,["ROWKEYIDENTIFIER", "9-2 LOL"]]);
  
  // On component mount, initialize team data                    
  useEffect(() => {
    
  },[]);


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
