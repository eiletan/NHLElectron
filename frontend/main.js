// Modules to control application life and create native browser window
const {app, Notification, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

const windowSettings = {
  title: "NHLElectron",
  width: 800,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
}

let mainWindow;
let audioWindow;

function createWindow (windowSettings,url) {
  // Create the browser window.
  mainWindow = new BrowserWindow(windowSettings);

  // and load the index.html of the app.
  mainWindow.loadURL(url);
  audioWindow = new BrowserWindow({
    title: "AudioWindow",
    show: false
  })
  audioWindow.loadURL(path.join(__dirname, "audio.html?volume=0.6&src=src/assets/audio/Vancouver Canucks.mp3&length=10000"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow(windowSettings,'http://localhost:3000');
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(windowSettings,'http://localhost:3000');
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle("invoke-Notification-With-Sound", (events, args) => {
  
});
