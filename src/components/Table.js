import React from 'react';
import '../css/Table.css';

export default function Table(props) {
    // Pass data for the table in the form of an array of objects, with each object representing a table row. The prop is "rows"
    // Pass the order in which the data should go in the table row as an array, with the list of keys in order. The prop is "dataRowOrder"
    // Pass the key name that will be used as table row key. The prop is "dataRowKey". If unspecified, then the index will be used
    // Pass the key name that will be used as table data cell key. The prop is "dataCellKey". If unspecified, then the index will be used 

    function createRowsAndData(arr, order, rowKey = null, cellKey = null) {
        // Check if array of data and order keys match
        let arrKeys = Object.keys(arr[0]);
        if (arrKeys.length != order.length) {
            throw new Error(`The number of keys for the column must be the same as the number of keys in the order array. 
            ${arrKeys.length} is not equal to ${order.length}`);
        }
        arrKeys.sort();
        let orderKeys = JSON.stringify(order);
        orderKeys = JSON.parse(orderKeys);
        orderKeys.sort();
        // Check if the keys are the same
        for (let a = 0; a < arrKeys.length; a++) {
            if (arrKeys[a] != orderKeys[a]) {
                throw new Error(`Column names are not the same: ${arrKeys[a]} is not equal to ${orderKeys[a]}`);
            }
        }

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