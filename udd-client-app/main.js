// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs');
const config = require('./config.json')

const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(__dirname + '/resources/img/logo.png');
 image.setTemplateImage(true);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

global.sharedObject = {
  someProperty: 'default value'
}



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    fullscreenable: true,
    icon:image,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      //experimentalFeatures: true,
      preload: path.join(__dirname, 'preload.js')
      
    
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('ip', config.ip.toString())
    mainWindow.webContents.send('port', config.port.toString())
  })



  fs.readFile('./config.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const config = JSON.parse(jsonString)
          console.log("IP address is", config.ip)
          console.log("Port is:", config.port)



  } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')

  mainWindow.loadURL(url.format({
  pathname: path.join(__dirname, "index.html"),
  protocol: 'file:',
  slashes: true

}

));

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);


  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

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
;

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
