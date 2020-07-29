const config = require('./config.json')
const fs = require('fs');


var urlMapbox = "https://api.mapbox.com/styles/v1/florsalatino/ckbajy7i90l6y1iqnrmr99vdo/tiles/256/{z}/{x}/{y}?access_token=";

export var urlBackground1; 
export var urlBackground2;
export var urlBackground3;
export var tokenMapbox;

export function readCondigFile(callback){

	fs.readFile('./config.json', 'utf8', (err, jsonString) => {
  if (err) {
      console.log("Error reading file from disk:", err)
      return
  }
  try {
      const config = JSON.parse(jsonString)
      console.log("Config file is ready... ")
      urlBackground1 = config.styleBackground1;
      urlBackground2 = config.styleBackground2;
      urlBackground3 = config.styleBackground3;
      tokenMapbox = config.mapboxToken;
      
      console.log("Config File - Background1: " + urlBackground1);

    if (typeof callback === 'function') { 
      callback(); 
    }

} catch(err) {
      console.log('Error parsing JSON string:', err)
  }
})


} 