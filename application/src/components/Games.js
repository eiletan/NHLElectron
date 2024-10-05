import React from 'react';
import {Table} from './Table';
// Component to display a list of games for the given day

export default function Games(props) {
    const gamesCellClassNames = ["gamesPreviewInfo awayTeamLogo","gamesPreviewInfo awayTeamAbbr",
                            "gamesPreviewInfo at","gamesPreviewInfo homeTeamAbbr","gamesPreviewInfo homeTeamLogo","gamesPreviewInfo startTime"];
    const dateOptions = {month: "short", day: "numeric", year: "numeric"};

    function processGames(gamesData, internalTeams) {
        let arrOfMaps = [];
        let gamesDataSorted = sortGamesByTime(gamesData);
        for (let game of gamesDataSorted) {
            let arrMap = [];
            let away = game["awayTeam"]["fullName"];
            let home = game["homeTeam"]["fullName"];
            let awayLogo = internalTeams?.[away]?.["logo"];
            let homeLogo = internalTeams?.[home]?.["logo"];
            if (!awayLogo) {
                awayLogo = "NHL.png";
            }
            if (!homeLogo) {
                homeLogo = "NHL.png";
            }
            let awayAbbr = game["awayTeam"]?.["abbrev"];
            let homeAbbr = game["homeTeam"]?.["abbrev"];
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
            let startTime = new Date(game["startTimeUTC"]);
            startTime = startTime.toLocaleString('en-US', { hour: 'numeric',minute: 'numeric', hour12: true });
            arrMap.push(["startTime",startTime]);
            arrMap.push(["ROWKEYIDENTIFIER", game["id"]]);
            let map = new Map(arrMap);
            arrOfMaps.push(map);
        }
        return arrOfMaps;
    }

    function sortGamesByTime(gamesData){
        for (let i = 0; i < gamesData.length; i++) {
            let minIndex = i;
            for (let j = i+1; j < gamesData.length; j++) {
                let jDate = new Date(gamesData[j]["startTimeUTC"]);
                let minDate = new Date(gamesData[minIndex]["startTimeUTC"]);
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
                <p className="componentText scheduledGamesDescriptor">Scheduled games for {new Date(props.date + "T00:00:00").toLocaleDateString("en-CA",dateOptions)}</p>
                <div className="gamesTableContainer">
                    <Table 
                        rows={processGames(props.gamesData,props.internalTeams)}
                        dataRowOrder={props.dataRowOrder}
                        dataRowKey={props.dataRowKey}
                        tableClassName={"gamesTable"}
                        cellClassNames={[gamesCellClassNames]}
                        onClickHandler={props.onClickHandler}
                        onHoverHandler={props.onHoverHandler}
                    />
                </div>
                
                </React.Fragment>
                }
            {(props.gamesData && props.internalTeams)
            && (props.gamesData.length == 0)
            && <p className="componentText scheduledGamesDescriptor">No games scheduled for {new Date(props.date + "T00:00:00").toLocaleDateString("en-CA",dateOptions)}</p>}
        </div>
        
        
    )
}