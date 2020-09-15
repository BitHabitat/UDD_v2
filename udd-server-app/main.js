// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const OSC = require('osc-js')
const fs = require('fs');
const config = require('./config.json')
const electron = require('electron');
const osc1 = new OSC({ plugin:  new OSC.WebsocketServerPlugin() })

//const osc2 = new OSC({ plugin:  new OSC.WebsocketServerPlugin() })
const { ipcMain } = require('electron')
const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(__dirname + '/resources/img/logo.png');
 image.setTemplateImage(true);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


osc1.on('open', () => {
  // connection was established
  console.log("connection was established")
});

osc1.on('error', (err) => {
  // an error occurred
  console.log("OSC ERROR!!!")
  console.log(err)
});

function createWindow () {
  //Look for second screen
  var electronScreen = electron.screen;
  var displays = electronScreen.getAllDisplays();
  
  var externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i];
      break;
    }
  }

  if (externalDisplay) {
    mainWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: 1920,
      height: 1080,
      icon:image,
      fullscreen: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        nodeIntegration: true
        }
    })
  }else{
    mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon:image,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
      }
    })
  }

  fs.readFile('./config.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const config = JSON.parse(jsonString)
          console.log("IP address is", config.ip)
          console.log("PORT1 is", config.port)



  } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    //mainWindow.webContents.send('ip', config.ip.toString())
    osc1.open({
      host: config.ip.toString(),    // @param {string} Hostname of WebSocket server
      port: parseInt(config.port.toString())            // @param {number} Port of WebSocket server
      }) // start server

      /*osc2.open({
        host: config.ip.toString(),    // @param {string} Hostname of WebSocket server
        port: parseInt(config.port_2.toString())          // @param {number} Port of WebSocket server
      }) // start server*/
  })


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
//Menu template
const mainMenuTemplate = [
  {
    label: 'Header',
    submenu:[
      {
        label: "Test",
        click(){
            //mainWindow.loadFile('loading.html')

        }
      }
    ]
  }
];


// -------- OSC RECEIVE ------------

osc1.on('/mapView', message => {

  mainWindow.webContents.send('viewMap', message.args);

})





osc1.on('/popup', message => {

  mainWindow.webContents.send('overlay', message.args);
})

osc1.on('/layer', message => {
  mainWindow.webContents.send('toggleLayer', message.args);
})


osc1.on('/activitats', message => {
  mainWindow.webContents.send('toggleLayerActivitats', message.args);

})

osc1.on('/reset', message => {
  mainWindow.webContents.send('hidePopups', message.args);
})


osc1.on('/mapBackground', message => {
  mainWindow.webContents.send('changeBcakground', message.args);
})

osc1.on('/screensaver', message => {
  mainWindow.webContents.send('blockScreen', message.args);
})


//JG
osc1.on('/map2', message => {
  mainWindow.webContents.send('map2', message.args);
})
osc1.on('/layersb', message => {
  mainWindow.webContents.send('layersb', message.args);
})


