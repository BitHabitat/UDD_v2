// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron');
const remote = require("electron").remote;
const mainWindow = remote.getCurrentWindow();
window.$ = window.jQuery = require('jquery');
const os = require('os');
const storage = require('electron-json-storage');

import * as layersConfig from './mapLayerStyles.js';
import * as generalConfig from './initConfig.js';
import * as  ol from 'ol';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import Zoom from 'ol/control/Zoom';
import Rotate from 'ol/control/Rotate';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import TileJSON from 'ol/source/TileJSON';
import {defaults as defaultControls, ScaleLine} from 'ol/control';

//Map
var mapBasic;
var layersMap;

var mapView = new View({
          constrainResolution: true,
          center: olProj.fromLonLat([2.1589899, 41.3887901]),
          rotation: 44.6 * Math.PI / 180,
          zoom: 12
});


mapBasic = new ol.Map({
  controls: defaultControls().extend([
    scaleControl()
  ]),
  view: mapView,
  target: 'map'
});

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
//var mapboxgl = require("https://api.mapbox.com/mapbox-gl-js/v1.11.1/mapbox-gl.js");
mapboxgl.accessToken = 'pk.eyJ1IjoiY29yb2xhcmkiLCJhIjoiY2tkN2l2dHltMDNmcjJ4cGNtamI1ano1aSJ9.TDO_vejWTmNAc2gnc3f7Dw';
var map00;
map00 = new mapboxgl.Map({
  container: 'map00',
  style: 'mapbox://styles/mapbox/streets-v11',
  //style: 'mapbox://bithabitat/ckc09tyw700jd1ip7m70db10c',
  center: [2.2021, 41.4112],
  zoom: 14
  });


var control;
function scaleControl() {
  control = new ScaleLine({
    units: "metric",
    className: 'custom-scale'
  });
  return control;
}


generalConfig.readCondigFile(function(){
  initMain();


})

var baseLayerGroup;
var mapboxStyleDark;
var mapboxStyleSatellite;
var mapboxStyleLight;

function initMain(){
  console.log("Init main...")

  //Basemaps
  mapboxStyleLight =  new TileLayer({
        source: new XYZ({
          url: "https://api.mapbox.com/styles/v1/" + generalConfig.urlBackground1 + "/tiles/256/{z}/{x}/{y}?access_token=" + generalConfig.tokenMapbox
        }),
        visible: true, 
        title: 'light'
  });
  mapboxStyleDark =  new TileLayer({
        source: new XYZ({
          url: "https://api.mapbox.com/styles/v1/" + generalConfig.urlBackground2 + "/tiles/256/{z}/{x}/{y}?access_token=" + generalConfig.tokenMapbox
        }),
        visible: false, 
        title: 'dark'
  });

  mapboxStyleSatellite =  new TileLayer({
        source: new XYZ({
          url: "https://api.mapbox.com/styles/v1/" + generalConfig.urlBackground3 + "/tiles/256/{z}/{x}/{y}?access_token=" + generalConfig.tokenMapbox
        }),
        visible: false,
        title: 'satellite'
  });



  baseLayerGroup = new LayerGroup({
    layers: [mapboxStyleDark, mapboxStyleSatellite, mapboxStyleLight]
  });

  mapBasic.addLayer(baseLayerGroup);
  
  mapBasic.getControls().forEach(function(control) {
      if (control instanceof Zoom) {
        mapBasic.removeControl(control);
      }
      if (control instanceof Rotate) {
        mapBasic.removeControl(control);
      }
  }, this);

  layersMap = mapBasic.getLayers().array_;
  downloadAndSaveData();


}

var mercats;
var featureMercats = [];
var farmacies;
var featureFarmacies = [];

var hospitals;
var featureHospitals = [];

var censComercialBCN;
var featureCensComercialBCN = [];

var loadedMarketsData = false;
var loadedHospitalsData = false;
var loadedPharmacyData = false;
var loadedComercialData = false;

function downloadAndSaveData(){
    //Get data from OPENDATABARCELONA
  storage.getMany([ 'marketsData', 'pharmacyData', 'hospitalsData', 'comercialData'], function(error, data) {
    if (error){
      throw error;
    } else{

      //Markets data
      if($.isEmptyObject(data.marketsData)){
        loadDataFromOpenDataBarcelona('98b893c2-ac83-4f34-b40a-19a4911a066b', 100, function(data) {
          mercats = data.result;
          console.log("JSON markets Downloaded from API");
          loadedMarketsData = true;

          //Save data locally
          storage.set('marketsData', mercats, function(error) {
            if (error){
              throw error;
            } 
          });
          layerMercatsParams.funcActiveLayer();
          checkAllDataIsLoaded();

        }, function(jqXHR, textStatus, errorThrown) {
          console.log("[ERROR] Mercats NOT loaded! >> " + errorThrown);
          //console.log(textStatus);
          mercats = null;
          //$('#marketButton').toggleClass('tagCloudDisabled');
          checkAllDataIsLoaded();
        });
      }else{
        //Read data from storage
        mercats = data.marketsData;
        loadedMarketsData = true;
        layerMercatsParams.funcActiveLayer();
        checkAllDataIsLoaded();
      }

      //Pharmacy data
      if($.isEmptyObject(data.pharmacyData)){
        loadDataFromOpenDataBarcelona('7d02a5a0-5339-4289-bc6b-7260484ff435', 2000, function(data) {
            farmacies = data.result;
            loadedPharmacyData = true;
          console.log("JSON Farmacies Downloaded");
          
          //Save data locally
          storage.set('pharmacyData', farmacies, function(error) {
            if (error){
              throw error;
            } 
          });

          layerFarmaciaParams.funcActiveLayer();  
          checkAllDataIsLoaded();

        }, function(jqXHR, textStatus, errorThrown) {
          console.log("[ERROR] Farmacies NOT loaded! >> " + errorThrown);
          
          farmacies = null;
          $('#pharmacyButton').toggleClass('tagCloudDisabled');

          checkAllDataIsLoaded();
          //console.log(textStatus);

        });
        
      }else{
        //Read data from storage
        farmacies = data.pharmacyData;
         loadedPharmacyData = true;
         layerFarmaciaParams.funcActiveLayer(); 
         checkAllDataIsLoaded();
      }

      //Hospitals data
      if($.isEmptyObject(data.hospitalsData)){
        loadDataFromOpenDataBarcelona('3cde43cd-d53a-4048-be38-4e0f8a384eea', 500, function(data) {
          hospitals = data.result;
          console.log("JSON hospitals Downloaded")
          loadedHospitalsData = true;


          //Save data locally
          storage.set('hospitalsData', hospitals, function(error) {
            if (error){
              throw error;
            } 
          });

          layerHospitalsParams.funcActiveLayer();
          checkAllDataIsLoaded();
          
        }, function(jqXHR, textStatus, errorThrown) {
          hospitals = null;
          console.log("[ERROR] HOSPITALS NOT loaded! >> " + errorThrown);
          $('#hospitalsButton').toggleClass('tagCloudDisabled');
          checkAllDataIsLoaded();
        });
        
        
      }else{
        //Read data from storage
        hospitals = data.hospitalsData;
        loadedHospitalsData = true;
        layerHospitalsParams.funcActiveLayer();
        checkAllDataIsLoaded();
      }

      //Comerç data
      if($.isEmptyObject(data.comercialData)){
        console.log("not comercial data found on local storage!")
        loadDataFromOpenDataBarcelona('c897c912-0f3c-4463-bdf2-a67ee97786ac', 90000, function(data) {
            censComercialBCN = data.result;
          console.log("JSON Cens Comercial Downloaded")
          loadedComercialData = true;


          //Save data locally
          storage.set('comercialData', censComercialBCN, function(error) {
            if (error){
              throw error;
            } 
          });

          checkAllDataIsLoaded();
        }, function(jqXHR, textStatus, errorThrown) {
          console.log("[ERROR] Cens Comercial NOT loaded! >> " + errorThrown);
          //$('#sidebar').toggleClass('hide');
          censComercialBCN = null;
          $('#comercialButton').toggleClass('tagCloudDisabled');
          layercensComercialBCNParams.funcActiveLayer();
          checkAllDataIsLoaded();
          //console.log(textStatus);

        });
       
        
      }else{
        //Read data from storage
        console.log("Loading comercial data from storage!")
        censComercialBCN = data.comercialData;
        loadedComercialData = true;
        layercensComercialBCNParams.funcActiveLayer();

        checkAllDataIsLoaded();

      }
    }

  });

}



function checkAllDataIsLoaded(){
  if(loadedComercialData && loadedHospitalsData && loadedPharmacyData && loadedMarketsData){

    console.log("All data is loaded!!!!")
  }
}

function loadDataFromOpenDataBarcelona(id, limitRows, callbackSuccess, callbackError){
  var data = {
    resource_id: id,
    limit: limitRows 
  };

  $.ajax({
    url: 'https://opendata-ajuntament.barcelona.cat/data/api/action/datastore_search?',
    data: data,
    dataType: 'json',
    success: callbackSuccess,
    error: callbackError 
  
  });
}


var farmaciesSource = new VectorSource();
var farmaciesLayer = new WebGLPointsLayer({
  source: farmaciesSource,
  style: layersConfig.farmaciesStyle,
  disableHitDetection: false
});


//Hospitals
var hospitalsSource = new VectorSource();
var hospitalsLayer = new WebGLPointsLayer({
  source: hospitalsSource,
  style: layersConfig.hospitalsStyle,
  disableHitDetection: false
});



var mercatsSource = new VectorSource();
var censComercialBCNSource = new VectorSource();
var censComercial_OciNocturnSource = new VectorSource();
var censComercial_open24Source = new VectorSource();
var censComercial_coworkingSource = new VectorSource();


var censComercialBCNLayer = new WebGLPointsLayer({
  source: censComercialBCNSource,
  style: layersConfig.styleComercial,
  disableHitDetection: false
});

var censComercialBCNOciNcoturn_Layer = new WebGLPointsLayer({
  source: censComercial_OciNocturnSource,
  style: layersConfig.styleOciNocturn,
  disableHitDetection: false
});


var censComercialBCNopen24_Layer = new WebGLPointsLayer({
  source: censComercial_open24Source,
  style: layersConfig.styleOpen24,
  disableHitDetection: false
});

var censComercialBCNCoworking_Layer = new WebGLPointsLayer({
  source: censComercial_coworkingSource,
  style: layersConfig.styleCoworking,
  disableHitDetection: false
});


//pop ups
var overlay = new Overlay({
  element: document.getElementById('overlay'),
  positioning: 'bottom-center'
});

var layerFarmaciaParams = { 
  layerMap: farmaciesLayer,
  layerActive: false,
  layerNameStyle:  "farmaciesStyle",
  funcActiveLayer: function (){
    // loop over the items in the response
      for(var i=0; i < farmacies.total; i++){
        // create a new feature with the item as the properties
        var feature = new Feature(farmacies.records[i]);

        // add a url property for later ease of access
        feature.set('type', "Farmacy");
        
        // create an appropriate geometry and add it to the feature
        var coordinate = olProj.fromLonLat([parseFloat(farmacies.records[i].LONGITUD), parseFloat(farmacies.records[i].LATITUD)]);
        var geometry = new Point(coordinate);

        feature.setGeometry(geometry);
        featureFarmacies.push(feature);
        
        // add the feature to the source
        farmaciesSource.addFeature(feature);

      }
  }
};

farmaciesLayer.set("name", layerFarmaciaParams.layerNameStyle);


var mercatsLayer = new WebGLPointsLayer({
  source: mercatsSource,
  style: layersConfig.mercatsStyle, 
  disableHitDetection: false
});

var layerMercatsParams = { 
  layerMap: mercatsLayer,
  layerActive: false,
  layerNameStyle:  "mercatsStyle",
  funcActiveLayer: function (){
    //console.log("total mercats:" + mercats.total);
    for(var i=0; i < mercats.total; i++){
      // create a new feature with the item as the properties
      var feature = new Feature(mercats.records[i]);

      // add a url property for later ease of access
      feature.set('type', "Market");
      // create an appropriate geometry and add it to the feature
      var coordinate = olProj.fromLonLat([parseFloat(mercats.records[i].LONGITUD), parseFloat(mercats.records[i].LATITUD)]);
      var geometry = new Point(coordinate);

      feature.setGeometry(geometry);
      featureMercats.push(feature);
      // add the feature to the source
      mercatsSource.addFeature(feature);

    }
  }
};

mercatsLayer.set("name", layerMercatsParams.layerNameStyle);


var layerHospitalsParams = { 
  layerMap: hospitalsLayer,
  layerActive: false,
  layerNameStyle:  "hospitalsStyle",
  funcActiveLayer: function (){
    for(var i=0; i < hospitals.total; i++){
      // create a new feature with the item as the properties
      var feature = new Feature(hospitals.records[i]);

      // add a url property for later ease of access
      feature.set('type', "Hospital");
      // create an appropriate geometry and add it to the feature
      var coordinate = olProj.fromLonLat([parseFloat(hospitals.records[i].LONGITUD), parseFloat(hospitals.records[i].LATITUD)]);
      var geometry = new Point(coordinate);

      feature.setGeometry(geometry);
      featureHospitals.push(feature);
      // add the feature to the source
      hospitalsSource.addFeature(feature);

    }
  }
};

hospitalsLayer.set("name", layerHospitalsParams.layerNameStyle);


var layercensComercialBCNParams = { 
  layerMap: censComercialBCNLayer,
  layerActive: false,
  layerNameStyle:  "censComercialBCNStyle",
  funcActiveLayer: function (){
    for(var i=0; i < censComercialBCN.total; i++){
      // create a new feature with the item as the properties
      var feature = new Feature(censComercialBCN.records[i]);

      // add a property for later ease of access
      feature.set('type', "Comercial");
      // create an appropriate geometry and add it to the feature
      var coordinate = olProj.fromLonLat([parseFloat(censComercialBCN.records[i].Longitud), parseFloat(censComercialBCN.records[i].Latitud)]);
      var geometry = new Point(coordinate);

      feature.setGeometry(geometry);
      feature.set('Activity', 0);
      if(censComercialBCN.records[i].Nom_Grup_Activitat == "Oci i cultura"){
        
        feature.set('nameLayer', "oci");
      } else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Activitats immobiliàries"){
        feature.set('nameLayer', "inmobiliaria");
   
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Manteniment, neteja i producció"){
       feature.set('nameLayer', "manteniment");

      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Reparacions (Electrodomèstics i automòbils)"){
        feature.set('nameLayer', "reparacions");


      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Equipaments culturals i recreatius"){
        feature.set('nameLayer', "recreatius");

      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Finances i assegurances"){
          feature.set('nameLayer', "finances");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Sanitat i assistència"){
          feature.set('nameLayer', "sanitat");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Grup no definit"){
        feature.set('nameLayer', "noDefinit");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Ensenyament"){
        feature.set('nameLayer', "ensenyament");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Equipament personal"){
        feature.set('nameLayer', "personal");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Quotidià no alimentari"){
       feature.set('nameLayer', "noAlimentari");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Quotidià alimentari"){
        feature.set('nameLayer', "alimentari");
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Parament de la llar"){
        feature.set('nameLayer', "llar"); 
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Restaurants, bars i hotels (Inclòs hostals, pensions i fondes)"){
        feature.set('nameLayer', "restaurants"); 
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Automoció"){
          feature.set('nameLayer', "automocio"); 
      }else if(censComercialBCN.records[i].Nom_Grup_Activitat == "Altres"){
        feature.set('nameLayer', "altres"); 
      }else{
          feature.set('Activity', 0);
      }


      featureCensComercialBCN.push(feature);
      // add the feature to the source
      censComercialBCNSource.addFeature(feature);


      if(censComercialBCN.records[i].SN_Coworking == "0"){
        //if it is a coworking add it to its source
        censComercial_coworkingSource.addFeature(feature);
      }

      if(censComercialBCN.records[i].SN_Oci_Nocturn == "0"){
    
        censComercial_OciNocturnSource.addFeature(feature);
      }

      if(censComercialBCN.records[i].SN_Obert24h == "0"){
        censComercial_open24Source.addFeature(feature);
      }
    }
  }
};

censComercialBCNLayer.set("name", layercensComercialBCNParams.layerNameStyle);
censComercialBCNCoworking_Layer.set("name", "coworkingLayer");
censComercialBCNopen24_Layer.set("name", "open24Layer");
censComercialBCNOciNcoturn_Layer.set("name", "ociNocturnLayer");


function resetMapFeatures(){
  //Hide pop ups 
  $('#overlay').empty();
  overlay.setPosition(undefined);

}

function showInfo(type, lon, lat, text1, text2, text3) {  
    var info;

    //var objectReceived = JSON.parse(decodeURIComponent(escape(info)))
    //console.log(objectReceived)

    if(type == "Market"){
      info = "<h5 style='margin: 0px;'>"+text1+"</h5>" + "<p style='margin:0px 0px 5px 0px;'> <i> Comerç / Mercats </i> </p>" + "<p class='pop-up-text'> Districte: "+text2 +"</p> <p class='pop-up-text-second'> Barri: " + text3 +"</p>";
    }

    if(type == "Farmacy"){
        info = "<h5 style='margin: 0px;'>"+text1+"</h5>" + "<p style='margin:0px 0px 5px 0px;'> <i> Sanitat / Farmàcies </i> </p>" + "<p class='pop-up-text'> Districte: "+ text2 +"</p>"; 
    }

    if(type == "Hospital"){
        info = "<h5 style='margin: 0px;'>"+text1+"</h5>" + "<p style='margin:0px 0px 5px 0px;'> <i> Sanitat / Farmàcies </i> </p>" + "<p class='pop-up-text'> Districte: "+text2 +"</p>"; 
    }

    if(type == "Comercial"){
      info = "<h5 style='margin: 0px;'>"+ text1 + "</h5> <p style='margin:0px 0px 5px 0px;'> <i> Comerç / Activitats comercials en planta baixa 2019 </i> </p> <p class='pop-up-text'> Activitat: "+ text2 +"</p> <p class='pop-up-text-second'> Grup: " + text3 +"</p>"; 
    }



    var element = overlay.getElement();
    element.innerHTML = info;

    var coord = olProj.fromLonLat([lon, lat])

    overlay.setPosition(coord);
    overlay.setOffset([0, -10]);
    mapBasic.addOverlay(overlay);
}


function showLayerMap(layer){

    mapBasic.addLayer(layer);
    console.log(mapBasic.getLayers())
}

function hideLayerMap(layerParams, layerID){
  layersMap.forEach(function (item, i, array) {    
      if(item.values_.name == layerID){
          mapBasic.removeLayer(layersMap[i]);
      }            
  }) 

  resetMapFeatures();
}


function activeLayerComercial(layer, active){
  resetMapFeatures();

  if(active){
    
    if(!layer.layerActive){
      console.log("Add layer")
      mapBasic.addLayer(layer.layerMap);
      layer.layerActive = true;
      
    }
  }else{
    if(layer.layerActive){
      layersMap.forEach(function (item, i, array) {    
        if(item.values_.name == layer.layerNameStyle){
            mapBasic.removeLayer(layersMap[i]);
            console.log("remove layer")
        }            
      }) 
      layer.layerActive = false;
    }
  }

}


//RECEIVE OSC MESSAGES------------------------------
ipcRenderer.on('viewMap', function(event, message){

  var mapcCenter = [message[0], message[1]]

  mapView.setCenter(mapcCenter);
  mapView.setResolution(message[2]);
  mapView.setRotation(message[3]);

});


ipcRenderer.on('hidePopups', function(event, message){
    resetMapFeatures();
});


ipcRenderer.on('overlay', function(event, message){
    showInfo(message[0], message[1],message[2],message[3], message[4], message[5]);
});


ipcRenderer.on('changeBcakground', function(event, message){
    
    var url;
    
    console.log(message)
  if(message[0] == "1"){
      //Dark
      console.log("change to dark")
    baseLayerGroup.getLayers().forEach(function(element, index, array){
     if(element.get('title') == "dark"){
       element.setVisible(true);

       console.log("visible")
     }else{
       element.setVisible(false);
       console.log("hide")
     }

    })
  }

  if(message[0] == "2"){
      //Satellite
      baseLayerGroup.getLayers().forEach(function(element, index, array){
      if(element.get('title') == "satellite"){
        element.setVisible(true);

      }else{
        element.setVisible(false);
      }

    })
  }

  if(message[0] == "3"){
      //Satellite
      baseLayerGroup.getLayers().forEach(function(element, index, array){
      if(element.get('title') == "light"){
        element.setVisible(true);

      }else{
        element.setVisible(false);
      }

    })
  }
    
});

ipcRenderer.on('blockScreen', function(event, message){
  if(message[0] == "0"){
    $("#initScreen").hide();

  }else{

    $("#initScreen").show();
  }

})

ipcRenderer.on('toggleLayer', function(event, message){
  console.log("Toggle layer: " + message);
  
  var layerTag = message[0];

   if(layerTag == 0){
    //$( "#layersActiveSidebar" ).append( "<div class='farmacies'> <div style='width: 20px; height: 20px; background-color: green; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Farmàcies</h4> </div>");
     showLayerMap(layerFarmaciaParams.layerMap, layerFarmaciaParams.layerNameStyle);  
  }

  if(layerTag == 1){
    hideLayerMap(layerFarmaciaParams.layerMap, layerFarmaciaParams.layerNameStyle);
    //$( ".farmacies" ).remove();
  }

  if(layerTag == 2){
    //$( "#layersActiveSidebar" ).append( "<div class='mercats'> <div style='width: 20px; height: 20px; background-color: yellow; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Mercats </h4> </div>");
    showLayerMap(layerMercatsParams.layerMap, layerMercatsParams.layerNameStyle);

  }

  if(layerTag == 3){
    //$( ".mercats" ).remove();
    hideLayerMap(layerMercatsParams.layerMap, layerMercatsParams.layerNameStyle);

  }

  if(layerTag == 4){
    //$( "#layersActiveSidebar" ).append( "<div class='hospitals'> <div style='width: 20px; height: 20px; background-color: red; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Hospitals </h4> </div>");
    showLayerMap(layerHospitalsParams.layerMap, layerHospitalsParams.layerNameStyle);

  }

  if(layerTag == 5){
    //$( ".hospitals" ).remove();
    hideLayerMap(layerHospitalsParams.layerMap, layerHospitalsParams.layerNameStyle);

  }


  if(layerTag == 6){
    //$( "#layersActiveSidebar" ).append( "<div class='ociNocturn'> <div style='width: 20px; height: 20px; background-color: #FF09CA; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Comerç - Oci Nocturn </h4> </div>");
    showLayerMap(censComercialBCNOciNcoturn_Layer, "ociNocturnLayer");

  }

  if(layerTag == 7){
   // $( ".ociNocturn" ).remove();
    hideLayerMap(censComercialBCNOciNcoturn_Layer, "ociNocturnLayer");

  }

  if(layerTag == 8){
    //$( "#layersActiveSidebar" ).append( "<div class='obert24'> <div style='width: 20px; height: 20px; background-color: #00FF00; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Comerç - Obert 24hs </h4> </div>");
    showLayerMap(censComercialBCNopen24_Layer, "open24Layer");

  }

  if(layerTag == 9){
    //$( ".obert24" ).remove();
    hideLayerMap(censComercialBCNopen24_Layer, "open24Layer");
  }

  if(layerTag == 10){
    //$( "#layersActiveSidebar" ).append( "<div class='coworkingLeyenda'> <div style='width: 20px; height: 20px; background-color: #FF7F00; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Comerç - Coworking </h4> </div>");
    showLayerMap(censComercialBCNCoworking_Layer, "coworkingLayer");

  }

  if(layerTag == 11){
    //$( ".coworkingLeyenda" ).remove();
    hideLayerMap(censComercialBCNCoworking_Layer, "coworkingLayer");
  }


  if(layerTag == 12){
    //$( "#layersActiveSidebar" ).append( "<div class='activitatsComercials'> <div style='width: 20px; height: 20px; background-color: white; position: absolute; margin-top: 8px; margin-left: 15px; border-radius: 8px'></div> <h4 style='margin-left: 41px; margin-top: 5px;'> Activitats comercials en planta baixa 2019 </h4> </div>");
    activeLayerComercial(layercensComercialBCNParams, true);
    var featuresComercial = censComercialBCNLayer.getSource().getFeatures();
    featuresComercial.forEach(function(item, i, array){
      if(item.get("nameLayer") != 'altres' && item.get("nameLayer") != 'noDefinit'){
        item.set('Activity', 1);
      }
    });
  }

  if(layerTag == 13){
    resetMapFeatures();
    //$( ".activitatsComercials" ).remove();
    var featuresComercial = censComercialBCNLayer.getSource().getFeatures();
    featuresComercial.forEach(function(item, i, array){
              item.set('Activity', 0);
    })
  }

});



ipcRenderer.on('toggleLayerActivitats', function(event, message){
  console.log("toggleLayerActivitats")
  console.log(message)

  resetMapFeatures();

  if(message[0] == 'true'){

    activeLayerComercial(layercensComercialBCNParams, true);
    
    var featuresComercial = censComercialBCNLayer.getSource().getFeatures();
    featuresComercial.forEach(function(item, i, array){
        if(item.get("nameLayer") == message[1]){
          item.set('Activity', 1);
        }
      })
  }else{
     var featuresComercial = censComercialBCNLayer.getSource().getFeatures();
    featuresComercial.forEach(function(item, i, array){
        if(item.get("nameLayer") == message[1]){
          item.set('Activity', 0);
        }
      })

  }

});


//JG INI
ipcRenderer.on('map2', function(event, message){
  change_map();
});
function change_map(){
  //alert("h");
  var x = document.getElementById("map00");
  var y = document.getElementById("mapBackground");
  if(x.style.display === "none") {
    y.style.display = "none";x.style.display = "inline-block";
  }
  else {
    x.style.display = "none";y.style.display = "block";
  }
  //themap=document.getElementById("map").style.display;
  //if(themap=="none") {document.getElementById("map").style.display="inline-block";document.getElementById("map2").style.display="none";}
  //else {document.getElementById("map2").style.display="inline-block";document.getElementById("map").style.display="none";}
}

ipcRenderer.on('layersb', function(event, message){
  //switchLayer0(message[0]);
  switchLayer0("light-v10");
});
function switchLayer0(layid) {console.log(layid);
  map00.setStyle('mapbox://styles/mapbox/' + layid);
  ////var layerId = layer.target.id;console.log(layerId);
  ////map00.setLayoutProperty('3d-buildings', 'visibility', 'visible');
  //map00.removeLayer('3d-buildings');
  //setTimeout(function() {put_layer3dB_0();},1000);
  }
  

//JG FIN

//-----------------------------------OLD------------------------
var fullscreen = false;
document.addEventListener("keydown", event => {
        console.log(event.key)
       switch (event.key) {
           case "Escape":
               window.close();
               break;
            case " ":
              fullscreen = !fullscreen;
              mainWindow.setFullScreen(fullscreen);

            }
   });





//-----------OTHER FUNCTIONS ---------------

// Assign an ontimeupdate event to the video element, and execute a function if the current playback position has changed
/*vid.ontimeupdate = function() {sendCurrentTimetoClient()};
function sendCurrentTimetoClient() {
  // Display the current position of the video in a p element with id="demo"
  //console.log(vid.currentTime);
  //console.log(vid.duration);

  ipcRenderer.sendSync('video-time', vid.currentTime.toFixed(0));
}*/
