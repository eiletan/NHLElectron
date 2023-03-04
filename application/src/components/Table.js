import React from 'react';
import '../css/Table.css';

export const Table = React.forwardRef((props,ref) => {
    const rowKey = "ROWKEYIDENTIFIER";
    // Pass data for the table in the form of an array of maps, with each map representing a table row. The prop is "rows"
    // Each map must contain a ROWKEYIDENTIFIER key, if you do not want to specify row key, then set the value to null
    // ROWKEYIDENTIFIER, if passed in, is also set in the html element as an "id" attribute.
    // Pass in class name for table container div. The prop is "tableContainerClassName". Optional.
    // Pass in class name for table. The prop is "tableClassName". Optional.
    // Pass in class name for table body. The prop is "tableBodyClassName". Optional.  
    // Pass the class names for each data cell as an array of arrays, with the list of class names in order in each subarray. The prop is "cellClassNames"
    // ... If the number of subarrays do not match the number of rows, it is assumed that all datacells will have the same classnames as the first array.
    // Pass the class names for each data row as an array, with the list of class names in order. The prop is "rowClassNames"
    // Pass in onClick handler. The prop is "onClickHandler". Optional.
    // Pass in array of functions for onMouseEnter and onMouseLeave. The prop is "onHoverHandler". Optional.
 
    

    function createRowsAndData() {
        // Check if every object in array is a map
        for (let i = 0; i < props.rows.length; i++) {
            if (!(props.rows[i] instanceof Map)) {
                throw new Error("One or more objects in the array representing table data is not a map.");
            }
        }
        // Check if rowKey is present in all the maps
        for (let l = 0; l < props.rows.length; l++) {
            if (props.rows[l].get(rowKey) === undefined) {
                throw new Error("Row key identifier not present in the row data");
            }
        }
        // Check if all Maps have same number of columns
        let mapKeys = Array.from(props.rows[0].keys());
        let numCol = mapKeys.length;
        let numRow = props.rows.length;
        for (let j = 1; j < props.rows.length; j++) {
            let arrMapKeys = Array.from(props.rows[j].keys());
            if (arrMapKeys.length !== numCol) {
                throw new Error(`Number of columns is not the same for each row. Expected number of columns is ${numCol}, actual number is ${arrMapKeys.length}`);
            }
        }
        // If props.cellClassNames is not null, check that it has the correct amount of class names
        if (props.cellClassNames) {
            // If the number of subarrays of cell class names do not match the number of rows, check only the first subarray
            if (props.rowClassNames && (props.cellClassNames.length != props.rowClassNames)) {
                if (props.cellClassNames[0].length != numCol-1) {
                    throw new Error(`Number of cell class names does not match the number of columns. Expected number of cell class names is ${numCol-1}, actual number is ${props.cellClassNames[0].length}`);
                }
            // If the number of subarrays of cell class names match the number of rows, check all subarrays 
            } else if (props.rowClassNames && (props.cellClassNames.length == props.rowClassNames)) {
                for (let subarr of props.cellClassNames) {
                    if (subarr.length != numCol-1) {
                        throw new Error(`Number of cell class names does not match the number of columns. Expected number of cell class names is ${numCol-1}, actual number is ${subarr.length}`);
                    }
                }
            // Else, check only the first subarray
            } else {
                if (props.cellClassNames[0].length != numCol-1) {
                    throw new Error(`Number of cell class names does not match the number of columns. Expected number of cell class names is ${numCol-1}, actual number is ${props.cellClassNames[0].length}`);
                }
            }
            
        }
        // If props.rowClassNames is not null, check that the length of the array is the same as number of columns
        if (props.rowClassNames && (props.rowClassNames.length !== numRow)) {
            throw new Error(`Number of row class names does not match the number of rows. Expected number of row class names is ${numRow}, actual number is ${props.rowClassNames.length}`);
        }

        let rows = [];
        props.rows.map((rowDataMap, index) => {
            let cells = [];
            let keys = Array.from(rowDataMap.keys());
            let rowId = null;
            for (let k = 0; k < keys.length; k++) {
                let cellData = rowDataMap.get(keys[k]);
                // Ignore ROWKEYIDENTIFIER since it is used for identifying the row in react, but also set it as an extra html attribute in the row
                // as "id"
                if (String(keys[k]) === String(rowKey)) {
                    rowId = cellData;
                    continue;
                }
                if (props.cellClassNames) {
                    // If subarray of cell class names exist for the current row, use that. Otherwise use the corresponding cell class name from the first subarray
                    cells.push(<td className={props.cellClassNames?.[index]?.[k] ? "tableDataCell " + props.cellClassNames[index][k] : "tableDataCell " + props.cellClassNames[0][k]}
                                    key={k}>{cellData}
                                </td>);
                } else {
                    cells.push(<td className={"tableDataCell"} key={k}>{cellData}</td>);
                }
                
            }
            let row;
            if (props.rowClassNames) {
                row = <tr onClick={props.onClickHandler ? props.onClickHandler : null}
                        onMouseEnter={props.onHoverHandler?.[0] ? props.onHoverHandler[0] : null}
                        onMouseLeave={props.onHoverHandler?.[1] ? props.onHoverHandler[1] : null}
                        className={"tableRow " + props.rowClassNames[index]} 
                        key={rowDataMap.get(rowKey) ? rowDataMap.get(rowKey) : index}
                        id={rowId ? rowId : null}>{cells}</tr>
            } else {
                row = <tr onClick={props.onClickHandler ? props.onClickHandler : null}
                        onMouseEnter={props.onHoverHandler?.[0] ? props.onHoverHandler[0] : null}
                        onMouseLeave={props.onHoverHandler?.[1] ? props.onHoverHandler[1] : null}
                        className="tableRow" 
                        key={rowDataMap.get(rowKey) ? rowDataMap.get(rowKey) : index}
                        id={rowId ? rowId : null}>{cells}</tr>
            }
                        
            rows.push(row);
        });
        return rows;
    }

    return (
        <div className={props.tableContainerClassName ? "tableContainer " + props.tableContainerClassName : "tableContainer"} ref={ref}>
            <table className={props.tableClassName ? "table " + props.tableClassName : "table"}>
                <tbody className={props.tableBodyClassName ? "tableBody " + props.tableBodyClassName : "tableBody"}>
                    {createRowsAndData()}
                </tbody>
            </table>
        </div>
    );
});