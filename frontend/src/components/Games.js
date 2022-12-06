import React from 'react';
import Table from './Table';
// Component to display a list of games for the given day

export default function Games(props) {
    // TODO1: Do not render table if gamesData is null or length 0
    // TODO2: Process data into maps before passing to table
    return (
        <Table 
            rows={props.gamesData}
            dataRowOrder={props.dataRowOrder}
            dataRowKey={props.dataRowKey} 
        />
        
    )
}