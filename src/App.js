import logo from './logo.svg';
import './css/App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Table from './components/Table';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Table 
          rows={[new Map([["col1", "VAN"],["col2", <img src={require("./assets/logos/Vancouver Canucks.png")}></img>],["ROWKEYIDENTIFIER", 13454]]), 
          new Map([["col1", "BOS"],["col2", <img src={require("./assets/logos/Boston Bruins.png")}></img>],["ROWKEYIDENTIFIER", null]])]}
          cellClassNames={["class1","class2"]}
          rowClassNames={["VAN","BOS"]}
          />
      </ErrorBoundary>
    </div>
  );
}

export default App;
