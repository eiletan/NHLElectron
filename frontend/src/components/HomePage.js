import {React, useEffect, useState, useRef} from 'react';
import Games from './Games';

export default function Homepage(props) {
    return (
        <div className="homePageContainer">
            <p className="componentText title">NHL APP</p>
            <Games gamesData={props.gamesData} date={props.date} internalTeams={props.internalTeams} onClickHandler={props.onClickHandler} onHoverHandler={props.onHoverHandler}></Games>
        </div>
    );
}