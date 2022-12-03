import React from 'react';
import Table from './Table';
// Component to display a list of games for the given day

export default function Games(props) {
    return (
        <Table 
            rows={props.gamesData}
            dataRowOrder={props.dataRowOrder}
            dataRowKey={props.dataRowKey} 
        />
        
    )
}