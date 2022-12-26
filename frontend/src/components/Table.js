import React from 'react';
import '../css/Table.css';

export default function Table(props) {
    const rowKey = "ROWKEYIDENTIFIER";
    // Pass data for the table in the form of an array of maps, with each map representing a table row. The prop is "rows"
    // Each map must contain a ROWKEYIDENTIFIER key, if you do not want to specify row key, then set the value to null
    // ROWKEYIDENTIFIER, if passed in, is also set in the html element as an "id" attribute.
    // Pass the class names for each data cell as an array, with the list of class names in order. The prop is "cellClassNames"
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
        // If props.cellClassNames is not null, check that the length of the array is the same as number of columns
        if (props.cellClassNames && (props.cellClassNames.length !== numCol-1)) {
            throw new Error(`Number of cell class names does not match the number of columns. Expected number of cell class names is ${numCol-1}, actual number is ${props.cellClassNames.length}`);
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
                    cells.push(<td className={"tableDataCell " + props.cellClassNames[k]} key={k}>{cellData}</td>);
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
        <div className="tableContainer">
            <table className="table">
                <tbody className="tableBody">
                    {createRowsAndData()}
                </tbody>
            </table>
        </div>
    );
}