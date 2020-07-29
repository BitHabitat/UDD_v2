 
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const remote = require("electron").remote;
const OSC = require('osc-js')
var osc = new OSC({ plugin:  new OSC.WebsocketClientPlugin() });
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
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import TileJSON from 'ol/source/TileJSON';
import {defaults as defaultControls, ScaleLine} from 'ol/control';
import Zoom from 'ol/control/Zoom';
import Rotate from 'ol/control/Rotate';


//Read config file


toggleLoading();
//Map
var mapBasic ;
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

var control;
function scaleControl() {
  control = new ScaleLine({
    units: "metric",
    className: 'custom-scale'
  });
  return control;
 
}


mapBasic.getControls().forEach(function(control) {
      if (control instanceof Zoom) {
        mapBasic.removeControl(control);
      }
      if (control instanceof Rotate) {
        mapBasic.removeControl(control);
      }
  }, this);


mapBasic.addControl(new Zoom({
    className: 'custom-zoom'
}));


generalConfig.readCondigFile(function(){
  initMain();
})


var viewMaxResolution;
var viewMinResolution;
var layersMap;

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
var  loadedComercialData = false;

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
        //console.log("Loading comercial data from storage!")
        censComercialBCN = data.comercialData;
        loadedComercialData = true;
        layercensComercialBCNParams.funcActiveLayer();

        checkAllDataIsLoaded();

      }
    }

  });

}

var baseLayerGroup;
var mapboxStyleLight;
var mapboxStyleDark;
var mapboxStyleSatellite;
var mapboxStyleLight;

function initMain(){

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


  $('#light').toggleClass('tagcloudActive', true);

  viewMaxResolution = mapBasic.getView().getMaxResolution();
  viewMinResolution = mapBasic.getView().getMinResolution();

  layersMap = mapBasic.getLayers().array_;
  //console.log(layersMap)

  mapBasic.on('click', showInfo);

  mapBasic.on('moveend', sendOSCMapView);

  downloadAndSaveData();



}

function checkAllDataIsLoaded(){
  if(loadedComercialData && loadedHospitalsData && loadedPharmacyData && loadedMarketsData){

    console.log("All buttons active again!!")
    $("#comercialButton").removeAttr("disabled");
    $("#ociNocturn").removeAttr("disabled");
    $("#open24").removeAttr("disabled");
    $("#coworking").removeAttr("disabled");

    $("#hospitalsButton").removeAttr("disabled");
    $("#pharmacyButton").removeAttr("disabled");
    $("#marketButton").removeAttr("disabled");

    //activeLayerComercial(layercensComercialBCNParams, true);
    //activeLayerComercial(layercensComercialBCNParams, false);
    
    var hideSidebar = $('#sidebar').hasClass("hide");

    if(hideSidebar){
      //Show sidebar
        $('#sidebar').toggleClass('hide');
    }

    var activeLoading = $('#loading').hasClass("loading-show");

    if(activeLoading){
      //Hide loading
      toggleLoading();
    }
  }else{

    if(!loadedComercialData){
      console.log("disabled button cens!!")
      $("#comercialButton").attr("disabled", true);
      $("#ociNocturn").attr("disabled", true);
      $("#open24").attr("disabled", true);
      $("#coworking").attr("disabled", true);
      
    }else{
      $("#comercialButton").removeAttr("disabled");
      $("#ociNocturn").removeAttr("disabled");
      $("#open24").removeAttr("disabled");
      $("#coworking").removeAttr("disabled");

    }

    if(!loadedHospitalsData){
      console.log("disabled button hospitals!!")
      $("#hospitalsButton").attr("disabled", true);
    }else{
      $("#hospitalsButton").removeAttr("disabled");
    }

    if(!loadedPharmacyData){
      console.log("disabled button farmacies!!")
      $("#pharmacyButton").attr("disabled", true);

    }else{
        $("#pharmacyButton").removeAttr("disabled");

    }

    if(!loadedMarketsData){
      console.log("disabled button mercats!!")
      $("#marketButton").attr("disabled", true);
      
    }else{
      $("#marketButton").removeAttr("disabled");
    } 


    var hideSidebar = $('#sidebar').hasClass("hide");

    if(hideSidebar){
      //Show sidebar
        $('#sidebar').toggleClass('hide');
    }

    var activeLoading = $('#loading').hasClass("loading-show");

    if(activeLoading){
      //Hide loading
      toggleLoading();
    }
  }
}


function sendOSCMapView(){
  
  if (osc.status() === OSC.STATUS.IS_OPEN) {
    
    const message = new OSC.Message('/mapView', mapView.getCenter()[0], mapView.getCenter()[1], mapView.getResolution(), mapView.getRotation());
    osc.send(message); 
    resetTimer();
  } 

  if (osc.status() === OSC.STATUS.IS_NOT_INITIALIZED) {
    console.log("OSC.STATUS.IS_NOT_INITIALIZED")
  } 

  if(osc.status() === OSC.STATUS.IS_CONNECTING){
    console.log("OSC.STATUS.IS_CONNECTING")
  }

  if(osc.status() === OSC.STATUS.IS_CLOSING){

    console.log("OSC.STATUS.IS_CLOSING")
  } 

  if(osc.status() === OSC.STATUS.IS_CLOSED){
    console.log("OSC.STATUS.IS_CLOSED")

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
    error: callbackError, 

  
  });
}

//Farmacies
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

//Mercats Layer
var mercatsSource = new VectorSource();
var mercatsLayer = new WebGLPointsLayer({
  source: mercatsSource,
  style: layersConfig.mercatsStyle, 
  disableHitDetection: false
});

//Cens comercial 
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


//Data interaction
function checkFeatureClicked(layer, checkboxID){
  //Hide pop ups
  resetMapFeatures();

  //if(!layer.layerActive){
  if($(checkboxID).is(':checked')){
    mapBasic.addLayer(layer.layerMap);
    layer.layerActive = true;
  }else{
    layersMap.forEach(function (item, i, array) {    
      if(item.values_.name == layer.layerNameStyle){
          mapBasic.removeLayer(layersMap[i]);
      }            
    }) 
    layer.layerActive = false;
  }
}



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

//Button sidebar farmacies
$('#pharmacyButton').change(function() {
  
  resetTimer();
  checkFeatureClicked(layerFarmaciaParams, "#pharmacyButton");    
  

  if(layerFarmaciaParams.layerActive){
    sendOSCMessageToServer("layer", 0);
  }else{
    sendOSCMessageToServer("layer", 1);
  }
     
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
      //feature.setStyle(layersConfig.mercatsStyle);
      featureMercats.push(feature);
      // add the feature to the source
      mercatsSource.addFeature(feature);

    }
  }
};

mercatsLayer.set("name", layerMercatsParams.layerNameStyle);

//Sidebar button for markets
$('#marketButton').change(function() {
  resetTimer();
  checkFeatureClicked(layerMercatsParams, "#marketButton");

  if(layerMercatsParams.layerActive){
    sendOSCMessageToServer("layer", 2);
  }else{
    sendOSCMessageToServer("layer", 3);
  }
    

});


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
      //feature.setStyle(layersConfig.hospitalsStyle);
      featureHospitals.push(feature);
      // add the feature to the source
      hospitalsSource.addFeature(feature);

    }
  }
};

hospitalsLayer.set("name", layerHospitalsParams.layerNameStyle);

//Sidebar button for Hospitals
$('#hospitalsButton').change(function() {
  //sendOSCMessageToServer("layer", 1);
  resetTimer();
  checkFeatureClicked(layerHospitalsParams, '#hospitalsButton');

  if(layerHospitalsParams.layerActive){
    sendOSCMessageToServer("layer", 4);
  }else{
    sendOSCMessageToServer("layer", 5);
  }
    
});

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


function deleteAllComercialLayers(){
  $("#coworking"). prop("checked", false).change();
  $("#ociNocturn"). prop("checked", false).change();
  $("#open24"). prop("checked", false).change();
  $('#allComercial').prop('checked', false).change();
  
  $("#pageSubmenu3").removeClass('show');
  activeLayerComercial(layercensComercialBCNParams, false);


 

  //sendOSCMessageToServer("layer", 13);


}


$("#comercialButton").change(function() {

  if($("#comercialButton").is(':checked')){


  }else{
    //Hide layers
    deleteAllComercialLayers();
    

  }

})


function activeLayerComercial(layer, active){
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

function sendOSCMessageCensComercialLayers(layer, show){

  if (osc.status() === OSC.STATUS.IS_OPEN) {
      const message = new OSC.Message("/activitats", show, layer);
      osc.send(message); 
  }  

}




function loadingActivitats(checkboxID, show){
  var idLoading;
  var checkBoxStyleID;

  checkBoxStyleID = '#' + checkboxID;
  idLoading = '#loading' + checkboxID;

  //console.log("Show loading! ")
  $(checkBoxStyleID).prop("disabled", true);
  $(idLoading).show("fade", function(){
    
    if(show){

      //Active layer 
      activeLayerComercial(layercensComercialBCNParams, true);
      var featuresComercial = censComercialBCNLayer.getSource().getFeatures();

      if(checkboxID == "allComercial"){
        $('#arrowScrollDown').show();

        featuresComercial.forEach(function(item, i, array){
          if(item.get("nameLayer") != 'altres' && item.get("nameLayer") != 'noDefinit'){
            item.set('Activity', 1);

          }
        })

        //Active all activitats layer
        $('#alimentari').prop('checked', true);
        //$('#noDefinit').prop('checked', true);
        //$('#altres').prop('checked', true);
        $('#oci').prop('checked', true);
        $('#inmobiliaria').prop('checked', true);
        $('#manteniment').prop('checked', true);
        $('#reparacions').prop('checked', true);
        $('#recreatius').prop('checked', true);
        $('#finances').prop('checked', true);
        $('#sanitat').prop('checked', true);
        $('#ensenyament').prop('checked', true);
        $('#restaurants').prop('checked', true);
        $('#automocio').prop('checked', true);
        $('#llar').prop('checked', true);
        $('#alimentari').prop('checked', true);
        $('#noAlimentari').prop('checked', true);
        $('#personal').prop('checked', true);

        sendOSCMessageToServer("layer", 12);

      }else{
        sendOSCMessageCensComercialLayers(checkboxID, "true");
        featuresComercial.forEach(function(item, i, array){
          if(item.get("nameLayer") == checkboxID){
            item.set('Activity', 1);
          }
        })
      }
      //console.log("HIDE loading! ")
      $(checkBoxStyleID).prop("disabled", false);
      $(idLoading).hide();
    }else{
      //Hiding layers
      var featuresComercial = censComercialBCNLayer.getSource().getFeatures();
     
     if(checkboxID == "allComercial"){
        featuresComercial.forEach(function(item, i, array){
              item.set('Activity', 0);
        })

        $('#alimentari').prop('checked', false);
        $('#noDefinit').prop('checked', false);
        $('#altres').prop('checked', false);
        $('#oci').prop('checked', false);
        $('#inmobiliaria').prop('checked', false);
        $('#manteniment').prop('checked', false);
        $('#reparacions').prop('checked', false);
        $('#recreatius').prop('checked', false);
        $('#finances').prop('checked', false);
        $('#sanitat').prop('checked', false);
        $('#ensenyament').prop('checked', false);
        $('#restaurants').prop('checked', false);
        $('#automocio').prop('checked', false);
        $('#llar').prop('checked', false);
        $('#alimentari').prop('checked', false);
        $('#noAlimentari').prop('checked', false);
        $('#personal').prop('checked', false);

        sendOSCMessageToServer("layer", 13);

        $('#arrowScrollDown').hide();
        $('#arrowScrollUp').hide();



     }else{

        sendOSCMessageCensComercialLayers(checkboxID, "false");
        featuresComercial.forEach(function(item, i, array){
            if(item.get("nameLayer") == checkboxID){
              item.set('Activity', 0);
            }
        }) 

     }

      $(checkBoxStyleID).prop("disabled", false);
      $(idLoading).hide();
    }
    
  });
}

$(":checkbox").change(function(){
  resetTimer();
  var checkboxID = this.id;

  $('#overlay').empty();
  overlay.setPosition(undefined);
  
  
  if(checkboxID == "allComercial" || checkboxID == "noDefinit" || checkboxID == "altres" || checkboxID == "oci" ||  checkboxID == "inmobiliaria" || checkboxID == "manteniment" || checkboxID == "reparacions" ||  checkboxID == "recreatius" || checkboxID == "finances" || checkboxID == "sanitat" || checkboxID == "ensenyament" || checkboxID == "restaurants" || checkboxID == "automocio" || checkboxID == "llar" || checkboxID == "alimentari" || checkboxID == "noAlimentari" || checkboxID == "personal"){
    if($(this).is(':checked')){
      
      loadingActivitats(checkboxID, true);

    }else{
      loadingActivitats(checkboxID, false);
    
    }
  }
})

//Sidebar button for coworkings
$( "#coworking" ).change(function() {
  resetTimer();
  $('#overlay').empty();
  overlay.setPosition(undefined);
  //deleteAllComercialLayers();

  if( $("#coworking").is(':checked') ) {
    sendOSCMessageToServer("layer", 10);
    mapBasic.addLayer(censComercialBCNCoworking_Layer);
  }else{
    //$("#leyenda").show();
    sendOSCMessageToServer("layer", 11);
    layersMap.forEach(function (item, i, array) {    
      if(item.values_.name == "coworkingLayer"){
          mapBasic.removeLayer(layersMap[i]);
      }            
    }) 
  } 
});

$( "#ociNocturn" ).change(function() {
  resetTimer();
  $('#overlay').empty();
  overlay.setPosition(undefined);
  //deleteAllComercialLayers();
  
  if( $("#ociNocturn").is(':checked') ) {
    sendOSCMessageToServer("layer", 6)
    mapBasic.addLayer(censComercialBCNOciNcoturn_Layer);
  }else{
    sendOSCMessageToServer("layer", 7);
    layersMap.forEach(function (item, i, array) {    
      if(item.values_.name == "ociNocturnLayer"){
          mapBasic.removeLayer(layersMap[i]);
      }            
    }) 
  } 
});

$( "#open24" ).change(function() {
  resetTimer();
  //Hide pop ups
  $('#overlay').empty();
  overlay.setPosition(undefined);


  if( $("#open24").is(':checked') ) {
    sendOSCMessageToServer("layer", 8);
    mapBasic.addLayer(censComercialBCNopen24_Layer);
  }else{
    sendOSCMessageToServer("layer", 9);
    //mapBasic.addLayer(layercensComercialBCNParams.layerMap);
    layersMap.forEach(function (item, i, array) {    
      if(item.values_.name == "open24Layer"){
          mapBasic.removeLayer(layersMap[i]);
      }            
    }) 

  } 
});


$( "#ReloadButtonSanitat" ).click(function() {
  resetTimer();
  //loadedMarketsData = false;
  //loadedHospitalsData = false;
  //loadedPharmacyData = false;
  //loadedComercialData = false;

  toggleLoading();
  downloadAndSaveData();
  
  /*storage.clear(function(error) {
    if (error){
      throw error;
    }else{
      downloadAndSaveData();
    } 
  });*/
 
});


function toggleLoading(){
  $('#loading').toggleClass('loading-show');
}


//Capes mapes
$( "#dark" ).click(function() {
  resetTimer();
  //Dark 
  if (osc.status() === OSC.STATUS.IS_OPEN) {
      const message = new OSC.Message('/mapBackground', "1");
      osc.send(message); 
  } 

  
  $('#dark').toggleClass('tagcloudActive', true);
  $('#satellite').toggleClass('tagcloudActive', false);
  $('#light').toggleClass('tagcloudActive', false);
   baseLayerGroup.getLayers().forEach(function(element, index, array){
     if(element.get('title') == "dark"){
       element.setVisible(true);

     }else{
       element.setVisible(false);
     }

  })
});

$( "#light" ).click(function() {
  resetTimer();
  //Dark 
  if (osc.status() === OSC.STATUS.IS_OPEN) {
      const message = new OSC.Message('/mapBackground', "3");
      osc.send(message); 
  } 

  
  $('#light').toggleClass('tagcloudActive', true);
  $('#dark').toggleClass('tagcloudActive', false);
  $('#satellite').toggleClass('tagcloudActive', false);
   baseLayerGroup.getLayers().forEach(function(element, index, array){
     if(element.get('title') == "light"){
       element.setVisible(true);
     }else{
       element.setVisible(false);
     }

  })
});

$( "#satellite" ).click(function() {
  resetTimer();
  //Satellite
  if (osc.status() === OSC.STATUS.IS_OPEN) {
      const message = new OSC.Message('/mapBackground', "2");
      osc.send(message); 
  } 
  
  $('#satellite').toggleClass('tagcloudActive', true);
  $('#dark').toggleClass('tagcloudActive', false);
  $('#light').toggleClass('tagcloudActive', false);
  
  baseLayerGroup.getLayers().forEach(function(element, index, array){
    if(element.get('title') == "satellite"){
      element.setVisible(true);

    }else{
      element.setVisible(false);
    }

  })
});


function resetMapFeatures(){
  //Hide pop ups 
  $('#overlay').empty();
  overlay.setPosition(undefined);
  sendOSCMessageToServer("reset", "true");
}

function showInfo(event) {
  resetTimer();
   if (mapBasic.getView().getInteracting() || mapBasic.getView().getAnimating()) {
    return;
  }

  var features = mapBasic.getFeaturesAtPixel(event.pixel);
  console.log(event.pixel[0])
  console.log(event.pixel[1])

  if (features.length == 0) {
    resetMapFeatures();
    
    return;
  }



  var properties = features[0].getProperties();
  resetMapFeatures();
  
  if(properties.type != undefined){
    if(properties.type == "Market"){
        var element = overlay.getElement();
        var info = "<h4 style='margin: 0px;'>"+properties.EQUIPAMENT+"</h4>" + "<p style='margin:0px 0px 20px 0px;'> <i> Comerç / Mercats </i> </p>" + "<p class='pop-up-text'> Districte: "+properties.NOM_DISTRICTE +"</p> <p class='pop-up-text-second'> Barri: " + properties.NOM_BARRI +"</p>";
        element.innerHTML = info;

        var coord = olProj.fromLonLat([parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD)])
        
        mapView.animate({
          center: coord,
          duration: 500
        });

        if (osc.status() === OSC.STATUS.IS_OPEN) {  
          const message = new OSC.Message('/popup', "Market", parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD), unescape(encodeURIComponent(JSON.stringify(properties.EQUIPAMENT))), unescape(encodeURIComponent(JSON.stringify(properties.NOM_DISTRICTE))), unescape(encodeURIComponent(JSON.stringify(properties.NOM_BARRI))) );
          osc.send(message); 
        }   

        overlay.setPosition(coord);
        overlay.setOffset([0, -10]);
        mapBasic.addOverlay(overlay);
    }

    if(properties.type == "Farmacy"){
        var element = overlay.getElement();
        var info = "<h4 style='margin: 0px;'>"+properties.EQUIPAMENT+"</h4>" + "<p style='margin:0px 0px 20px 0px;'> <i> Sanitat / Farmàcies </i> </p>" + "<p class='pop-up-text'> Districte: "+properties.NOM_DISTRICTE +"</p>"; 
        element.innerHTML = info;

        var coord = olProj.fromLonLat([parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD)]);

        mapView.animate({
          center: coord,
          duration: 500
        });

        if (osc.status() === OSC.STATUS.IS_OPEN) {
          const message = new OSC.Message('/popup', "Farmacy", parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD), unescape(encodeURIComponent(JSON.stringify(properties.EQUIPAMENT))), unescape(encodeURIComponent(JSON.stringify(properties.NOM_DISTRICTE))));
          osc.send(message); 
        }  

        overlay.setPosition(coord);
        overlay.setOffset([0, -10]);
        mapBasic.addOverlay(overlay);
    }

     if(properties.type == "Hospital"){

        features[0].setStyle(layersConfig.hospitalsSelectedStyle);
        var element = overlay.getElement();
        var info = "<h4 style='margin: 0px;'>"+properties.EQUIPAMENT+"</h4>" + "<p style='margin:0px 0px 20px 0px;'> <i> Sanitat / Farmàcies </i> </p>" + "<p class='pop-up-text'> Districte: "+properties.NOM_DISTRICTE +"</p>"; 
        element.innerHTML = info;
        var coord = olProj.fromLonLat([parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD)])

        mapView.animate({
          center: coord,
          duration: 500
        });

        if (osc.status() === OSC.STATUS.IS_OPEN) {
          const message = new OSC.Message('/popup', "Hospital", parseFloat(properties.LONGITUD), parseFloat(properties.LATITUD), unescape(encodeURIComponent(JSON.stringify(properties.EQUIPAMENT))), unescape(encodeURIComponent(JSON.stringify(properties.NOM_DISTRICTE))));
          osc.send(message); 
        }  


        overlay.setPosition(coord);
        overlay.setOffset([0, -10]);
        mapBasic.addOverlay(overlay);
    }


    if(properties.type == "Comercial"){
        var element = overlay.getElement();
        
        var info = "<h4 style='margin: 0px;'>"+ properties.Nom_Local + "</h4> <p style='margin:0px 0px 20px 0px;'> <i> Comerç / Activitats comercials en planta baixa 2019 </i> </p> <p class='pop-up-text'> Activitat: "+ properties.Nom_Activitat +"</p> <p class='pop-up-text-second'> Grup: " + properties.Nom_Grup_Activitat +"</p>"; 

        element.innerHTML = info;
        var coord = olProj.fromLonLat([parseFloat(properties.Longitud), parseFloat(properties.Latitud)])
        mapView.animate({
          center: coord,
          duration: 500
        });


        if (osc.status() === OSC.STATUS.IS_OPEN) {
          const message = new OSC.Message('/popup',"Comercial", parseFloat(properties.Longitud), parseFloat(properties.Latitud), unescape(encodeURIComponent(JSON.stringify(properties.Nom_Local))),unescape(encodeURIComponent(JSON.stringify(properties.Nom_Activitat))), unescape(encodeURIComponent(JSON.stringify(properties.Nom_Grup_Activitat))));
          osc.send(message); 
        }  

        overlay.setPosition(coord);
        overlay.setOffset([0, -10]);
        mapBasic.addOverlay(overlay);
    }
    

  }else{    
    resetMapFeatures();
  }
  
}





 
//------------------OLD-------------------------------------------------
var ip= "";
var port;
require('electron').ipcRenderer.on('ip', (event, message) => {
      console.log("ip!")
      console.log(message)

      ip = message;

})

require('electron').ipcRenderer.on('port', (event, message) => {
      console.log("port!")
      console.log(message)

      port = message;
      startOSC();

})


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

function startOSC(){

  var auxPort = Number.parseFloat(port)
  osc.open({
    host: ip,    // @param {string} Hostname of WebSocket server
    port: auxPort            // @param {number} Port of WebSocket server
  }); // connect by default to ws://localhost:8080

}

$('#arrowScrollDown').hide();
$('#arrowScrollUp').hide();


$( "#arrowScrollDown" ).click(function() {
  resetTimer();
  var currentTop = $('#scrollSection').scrollTop();
  $('#scrollSection').scrollTop( currentTop+10 );

});

$( "#arrowScrollUp" ).click(function() {
  resetTimer();
  var currentTop = $('#scrollSection').scrollTop();
  $('#scrollSection').scrollTop( currentTop-10 );

});

$('#scrollSection').scroll(function (event) {
    resetTimer();
    var top = $('#scrollSection').scrollTop();
    // Do something

    if(top == 0){
      $('#arrowScrollDown').show();
      $('#arrowScrollUp').hide();
    }else if(top > 280){
      $('#arrowScrollDown').hide();
      $('#arrowScrollUp').show();
    }else{
      $('#arrowScrollDown').show();
      $('#arrowScrollUp').show();
    }
});


var menuInteraction = false;


//------------ NAVIGATION ----------



$("#initScreen").click(function(){
  $("#initScreen").hide();
  sendOSCMessageToServer("screensaver", "0");
})


var timerID;

function resetTimer(){

  console.log("Start timer again!!")
  console.log("wait: " + generalConfig.screenSaverWait)
  clearTimeout(timerID);
  timerID = setTimeout(initInteraction, generalConfig.screenSaverWait);

  
}


function initInteraction(){
   $("#initScreen").show();
   sendOSCMessageToServer("screensaver", "1");

}




//----------SEND OSC MESSAGE--------
function sendOSCMessageToServer(tag, value){
  var message = new OSC.Message(tag, value);
  osc.send(message);
}







