import React from 'react';
import '../css/Table.css';

export default function Table(props) {
    // Pass data for the table in the form of an array of objects, with each object representing a table row. The prop is "data"
    // Pass the order in which the data should go in the table row as an array, with the list of keys in order. The prop is "dataRowOrder"
    // Pass the key name that will be used as table row key. The prop is "dataRowKey". If unspecified, then the index will be used
    // Pass the key name that will be used as table data cell key. The prop is "dataCellKey". If unspecified, then the index will be used 

    function createRowsAndData(arr, order, rowKey = null, cellKey = null) {
        let rows = [];
        arr.map((rowDataObj, index) => {
            let cells = [];
            for (let i = 0; i < order.length; i++) {
                let cellData = rowDataObj[order[i]];
                cells.push(<td className="tableDataCell" key={cellKey ? rowDataObj[cellKey] : i}>{cellData}</td>);
            }
            let row = <tr className="tableRow" key={rowKey ? rowDataObj[rowKey] : index}>{cells}</tr>
            rows.push(row);
        });
        return rows;
    }

    return (
        <div className="tableContainer">
            <table className="table">
                <tbody className="tableBody">
                    {createRowsAndData(props.rows,props.dataRowOrder,props.dataRowKey,props.dataCellKey)}
                </tbody>
            </table>
        </div>
    );
}