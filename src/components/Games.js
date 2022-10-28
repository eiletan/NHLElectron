import React from 'react';
import Table from './Table';
const gameFns = require('../js/game');
// Component to display a list of games for the given day

export default function Games(props) {
    
    const [gamesList,setGamesList] = useState(null);


    return (
        <Table 
            rows={props.gamesData}
            dataRowOrder={props.dataRowOrder}
            dataRowKey={props.dataRowKey} 
        />
        
    )
}