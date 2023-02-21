import React from 'react';
import {Table} from './Table';
// Component to display a list of games for the given day

export default function Games(props) {
    const gamesCellClassNames = ["gamesPreviewInfo awayTeamLogo","gamesPreviewInfo awayTeamAbbr",
                            "gamesPreviewInfo at","gamesPreviewInfo homeTeamAbbr","gamesPreviewInfo homeTeamLogo","gamesPreviewInfo startTime"];

    function processGames(gamesData, internalTeams) {
        let arrOfMaps = [];
        let gamesDataSorted = sortGamesByTime(gamesData);
        for (let game of gamesDataSorted) {
            let arrMap = [];
            let away = game["teams"]["away"]["team"]["name"];
            let home = game["teams"]["home"]["team"]["name"];
            let awayLogo = internalTeams?.[away]?.["logo"];
            let homeLogo = internalTeams?.[home]?.["logo"];
            if (!awayLogo) {
                awayLogo = "NHL.png";
            }
            if (!homeLogo) {
                homeLogo = "NHL.png";
            }
            let awayAbbr = internalTeams?.[away]?.["abbreviation"];
            let homeAbbr = internalTeams?.[home]?.["abbreviation"];
            if (!awayAbbr) {
                awayAbbr = away;
            }
            if (!homeAbbr) {
                homeAbbr = home;
            }
            arrMap.push(["awayLogo",<img src={require('../assets/logos/' + awayLogo)}></img>]);
            arrMap.push(["awayAbbr",awayAbbr]);
            arrMap.push(["at", "@"]);
            arrMap.push(["homeAbbr",homeAbbr]);
            arrMap.push(["homeLogo",<img src={require('../assets/logos/' + homeLogo)}></img>]);
            let startTime = new Date(game["gameDate"]);
            startTime = startTime.toLocaleString('en-US', { hour: 'numeric',minute: 'numeric', hour12: true });
            arrMap.push(["startTime",startTime]);
            arrMap.push(["ROWKEYIDENTIFIER", game["gamePk"]]);
            let map = new Map(arrMap);
            arrOfMaps.push(map);
        }
        return arrOfMaps;
    }

    function sortGamesByTime(gamesData){
        for (let i = 0; i < gamesData.length; i++) {
            let minIndex = i;
            for (let j = i+1; j < gamesData.length; j++) {
                let jDate = new Date(gamesData[j]["gamePk"]);
                let minDate = new Date(gamesData[minIndex]["gamePk"]);
                if (jDate.getTime() < minDate.getTime()) {
                    minIndex = j;
                }
            }
            let temp = gamesData[i];
            gamesData[i] = gamesData[minIndex];
            gamesData[minIndex] = temp;
        }
        return gamesData;
    }

    return (
        <div className="gamesContainer">
            {(props.gamesData && props.internalTeams) 
            && (props.gamesData.length != 0)
            && <React.Fragment>
                <p className="componentText scheduledGamesDescriptor">Scheduled games for {props.date}</p>
                <Table 
                    rows={processGames(props.gamesData,props.internalTeams)}
                    dataRowOrder={props.dataRowOrder}
                    dataRowKey={props.dataRowKey}
                    tableClassName={"gamesTable"}
                    cellClassNames={[gamesCellClassNames]}
                    onClickHandler={props.onClickHandler}
                    onHoverHandler={props.onHoverHandler}
                />
                </React.Fragment>
                }
            {(props.gamesData && props.internalTeams)
            && (props.gamesData.length == 0)
            && <p className="componentText scheduledGamesDescriptor">No games scheduled for {props.date}</p>}
        </div>
        
        
    )
}