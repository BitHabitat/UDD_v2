import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

export var mercatsStyle = {
  symbol: {
    symbolType: 'image',
    src: './resources/img/marketsFeature.png',
    size: [
      "interpolate",["linear"],
      [
        "zoom"
      ],
      16,
      100,
      14,
      50,
      10,
      20
    ],
    opacity: 0.8,
    rotateWithView: false,
    offset: [
      0,
      0
    ]
  }
};



export var hospitalsStyle = {
  symbol: {
    symbolType: 'image',
    src: './resources/img/hospitalFeature.png',
    size: [
      "interpolate",["linear"],
      [
        'zoom'
      ],
      16,
      25,
      14,
      20,
      10,
      10
    ],
    opacity: 0.8,
    rotateWithView: false,
    offset: [
      0,
      0
    ]
  }
};


export  var farmaciesStyle = {
  symbol: {
    symbolType: 'image',
    src: './resources/img/pharmacyFeature.png',
    size: [
      "interpolate",["linear"],
      [
        'zoom'
      ],
      16,
      25,
      14,
      20,
      10,
      10
    ],
    opacity: 0.8,
    rotateWithView: false,
    offset: [
      0,
      0
    ]
  }
};

export var styleComercial = {
  "variables": {
    "minLayer": 1
  },
  "filter": ['==', ['get', 'Activity'],['var', 'minLayer']],
  "symbol": {
    "symbolType": "circle",
    "size": [
      "interpolate",
      [
        "exponential",
        1
      ],
      [
        "zoom"
      ],
      20,
      30,
      15,
      5,
      10,
      1
    ],
    //"color": "#E637BF",
    "color":[
      'match',
      ['get', 'Nom_Grup_Activitat'],
      'Altres', [120,120,120,0.5],
      'Automoció', "#03d9d7",
      'Restaurants, bars i hotels (Inclòs hostals, pensions i fondes)', "#274fb9",
      'Parament de la llar', '#ffcc86',
      'Quotidià alimentari', "#dfe445",
      'Quotidià no alimentari', '#fbe478',
      'Equipament personal', "#f5007c",
      'Ensenyament', "#ff9b62",
      'Grup no definit', [120,120,120,0.5],
      'Reparacions (Electrodomèstics i automòbils)', "#10c2de",
      'Sanitat i assistència', "#ff6b4e",
      'Finances i assegurances', "#a6489b",
      'Equipaments culturals i recreatius', "#ff1924",
      'Oci i cultura', "#e00d38",
      'Manteniment, neteja i producció', "#2e90cc",
      'Activitats immobiliàries', "#00bac6",
      "#00dea2"
    ],
    "offset": [
      0,
      0
    ]
    //"opacity": 0.5
  }
}


export var styleOpen24 = {
  "symbol": {
    "symbolType": "image",
    "src" : './resources/img/obert24hs.png',
    "size": [
      "interpolate",
      [
        "exponential",
        1
      ],
      [
        "zoom"
      ],
      20,
      35,
      15,
      15,
      10,
      5
    ],
    "offset": [
      0,
      0
    ]
  }
}

export var styleOciNocturn = {
  "symbol": {
    "symbolType": "image",
    "src" : './resources/img/ociNocturn.png',
    "size": [
      "interpolate",
      [
        "exponential",
        1
      ],
      [
        "zoom"
      ],
      20,
      35,
      15,
      15,
      10,
      5
    ],
    "offset": [
      0,
      0
    ]
  }
}

export var styleCoworking = {
  "symbol": {
    "symbolType": "image",
    "src" : './resources/img/coworking.png',
    "size": [
      "interpolate",
      [
        "exponential",
        1
      ],
      [
        "zoom"
      ],
      20,
      35,
      15,
      15,
      10,
      5
    ],
    "offset": [
      0,
      0
    ]
  }
}

