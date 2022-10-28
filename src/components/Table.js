import React from 'react';
import '../css/Table.css';

export default function Table(props) {
    const rowKey = "ROWKEYIDENTIFIER";
    // Pass data for the table in the form of an array of maps, with each map representing a table row. The prop is "rows"
    // Each map must contain a ROWKEYIDENTIFIER key, if you do not want to specify row key, then set the value to null
    // Pass the class names for each data cell as an array, with the list of class names in order. The prop is "cellClassNames"
    // Pass the class names for each data row as an array, with the list of class names in order. The prop is "rowClassNames"

    function createRowsAndData(arr, cellClassNames = null, rowClassNames = null) {
        // Check if every object in array is a map
        for (let i = 0; i < arr.length; i++) {
            if (!(arr[i] instanceof Map)) {
                throw new Error("One or more objects in the array representing table data is not a map.");
            }
        }
        // Check if rowKey is present in all the maps
        for (let l = 0; l < arr.length; l++) {
            if (arr[l].get(rowKey) === undefined) {
                throw new Error("Row key identifier not present in the row data");
            }
        }
        // Check if all Maps have same number of columns
        let mapKeys = Array.from(arr[0].keys());
        let numCol = mapKeys.length;
        let numRow = arr.length;
        for (let j = 1; j < arr.length; j++) {
            let arrMapKeys = Array.from(arr[j].keys());
            if (arrMapKeys.length !== numCol) {
                throw new Error(`Number of columns is not the same for each row. Expected number of columns is ${numCol}, actual number is ${arrMapKeys.length}`);
            }
        }
        // If cellClassNames is not null, check that the length of the array is the same as number of columns
        if (cellClassNames && (cellClassNames.length !== numCol-1)) {
            throw new Error(`Number of cell class names does not match the number of columns. Expected number of cell class names is ${numCol-1}, actual number is ${cellClassNames.length}`);
        }
        // If rowClassNames is not null, check that the length of the array is the same as number of columns
        if (rowClassNames && (rowClassNames.length !== numRow)) {
            throw new Error(`Number of row class names does not match the number of rows. Expected number of row class names is ${numRow}, actual number is ${rowClassNames.length}`);
        }

        let rows = [];
        arr.map((rowDataMap, index) => {
            let cells = [];
            let keys = Array.from(rowDataMap.keys());
            for (let k = 0; k < keys.length; k++) {
                let cellData = rowDataMap.get(keys[k]);
                // Ignore ROWKEYIDENTIFIER since it is used for identifying the row in react
                if (String(keys[k]) === String(rowKey)) {
                    continue;
                }
                if (cellClassNames) {
                    cells.push(<td className={"tableDataCell " + cellClassNames[k]} key={k}>{cellData}</td>);
                } else {
                    cells.push(<td className={"tableDataCell"} key={k}>{cellData}</td>);
                }
                
            }
            let row;
            if (rowClassNames) {
                row = <tr className={"tableRow " + rowClassNames[index]} key={rowDataMap.get(rowKey) ? rowDataMap.get(rowKey) : index}>{cells}</tr>
            } else {
                row = <tr className="tableRow" key={rowDataMap.get(rowKey) ? rowDataMap.get(rowKey) : index}>{cells}</tr>
            }
            
            rows.push(row);
        });
        return rows;
    }

    return (
        <div className="tableContainer">
            <table className="table">
                <tbody className="tableBody">
                    {createRowsAndData(props.rows,props.cellClassNames, props.rowClassNames)}
                </tbody>
            </table>
        </div>
    );
}