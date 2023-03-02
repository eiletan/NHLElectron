import { allowedImageFormats } from "./allowedImageFormats";

/**
   * Function that converts an array of JSON objects to an array of Map objects
   * @param {Array} jarr JSON Array
   * @param {Array} order An array of strings that denotes the order of the keys. Optional parameter
   */
 export function convertJSONArrayToMapArray(jarr, order = []) {
    let arr = [];
    for (let obj of jarr) {
      arr.push(convertJSONToMap(obj,order));
    }
    return arr; 
  }

  /**
   * Function that converts a JSON object to a Map object
   * @param {Object} obj The JSON object
   * @param {Array} order An array of strings that denotes the order of the keys. If empty, then it 
   * is assumed that the order does not matter. Invalid keys are ignored
   */
  export function convertJSONToMap(obj, order = []) {
    let keyArr = [];
    let arrForMap = [];
    if (order.length == 0) {
      keyArr = Object.keys(obj);
    } else {
      keyArr = order;
    }
    for (let key of keyArr) {
      let val = obj[key];
      let arr = []
      if (val != null || val != undefined) {
        arr.push(key);
        let valStr = String(val);
        let extension = valStr.substring(valStr.lastIndexOf("."));
        
        if (allowedImageFormats.includes(extension)) {
          let img = <img src={require("../assets/logos/" + val)}></img>;
          arr.push(img);
        } else {
          arr.push(val);
        }
        arrForMap.push(arr);
        }
      }
      return new Map(arrForMap);
  }

/**
   * Determines the winner of the game
   * @param {Object} game Internal game object
   * @returns JSON object containing information about the game win; type of win, winning team, and final score
   */
export function determineWinner(game) {
  let state = game["currentState"];
  let winnerJSON = {};
  winnerJSON["awayGoals"] = state["away"]["goals"];
  winnerJSON["homeGoals"] = state["home"]["goals"];
  winnerJSON["awayShort"] = game["away"]["abbreviation"];
  winnerJSON["away"] = game["away"]["name"];
  winnerJSON["homeShort"] = game["home"]["abbreviation"];
  winnerJSON["home"] = game["home"]["name"];
  if (state["period"] == "3rd" || state["period"] == "OT") {
      if (state["period"].valueOf() == "3rd") {
          winnerJSON["winType"] = "Regulation";
      } else {
          winnerJSON["winType"] = "Overtime";
      }
      if (state["away"]["goals"] > state["home"]["goals"]) {
          winnerJSON["winnerShort"] = game["away"]["abbreviation"];
          winnerJSON["winner"] = game["away"]["name"];
          winnerJSON["winnerLoc"] = "away"; 

      } else {
          winnerJSON["winnerShort"] = game["home"]["abbreviation"];
          winnerJSON["winner"] = game["home"]["name"];
          winnerJSON["winnerLoc"] = "home";
      }
  } else if (state["period"] == "SO") {
      winnerJSON["winType"] = "Shootout";
      if (state["away"]["shootoutGoalsScored"] > state["home"]["shootoutGoalsScored"]) {
          winnerJSON["winnerShort"] = game["away"]["abbreviation"];
          winnerJSON["winner"] = game["away"]["name"];
          winnerJSON["winnerLoc"] = "away";
      } else {
          winnerJSON["winnerShort"] = game["home"]["abbreviation"];
          winnerJSON["winner"] = game["home"]["name"];
          winnerJSON["winnerLoc"] = "home";
      }
  }
  return winnerJSON;
}