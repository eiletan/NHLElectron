import React from 'react';
import Table from './Table';

export default function Games(props) {
    return (
        <Table 
            rows={props.gamesData}
            dataRowOrder={props.dataRowOrder}
            dataRowKey={props.dataRowKey} 
        />
        
    )
}