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
          let img = <img src={require("" + val)}></img>;
          arr.push(img);
        } else {
          arr.push(val);
        }
        arrForMap.push(arr);
        }
      }
      return new Map(arrForMap);
  }