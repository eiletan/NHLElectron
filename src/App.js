import logo from './logo.svg';
import './css/App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Table from './components/Table';

function App() {
  const map1 = new Map([["col1", <img src={require("./assets/logos/Boston Bruins.png")}></img>]
                        ,["col2", "BOS"], ["col3", "@"], ["col4", "VAN"]
                        ,["col5", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>]
                        ,["col6", "7:00PM"]
                      ,["ROWKEYIDENTIFIER", "9-2 LOL"]]);
  return (
    <div className="App">
      <ErrorBoundary>
        <Table 
          rows={[map1,map1]}
          classNames={["class1","class1","class1","class1","class1","class1"]}
          />
      </ErrorBoundary>
    </div>
  );
}

export default App;
