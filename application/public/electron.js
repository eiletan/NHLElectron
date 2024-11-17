// Modules to control application life and create native browser window
const {app, Notification, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const game = require('../logic/src/controller/game');
const init = require('../logic/src/controller/init');
const util = require('../logic/src/controller/util');

const windowSettings = {
  title: "NHLElectron",
  width: 1000,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, '..', 'preload.js')
  },
  frame: false
};

const startUrl = "http://localhost:3000";

let internalTeams;

let gamesData = {};

let mainWindow;
let audioWindow;

function createWindow (windowSettings,url) {
  // Create the browser window.
  mainWindow = new BrowserWindow(windowSettings);

  // and load the index.html of the app.
  const windowUrl = app.isPackaged 
    ? `file://${path.join(__dirname, "./index.html")}`
    : url;
  mainWindow.loadURL(windowUrl);
  audioWindow = new BrowserWindow({
    title: "AudioWindow",
    show: false
  })
  audioWindow.loadURL(path.join(__dirname, "..", "audio.html"));

  mainWindow.on("close", function () {
    audioWindow.close();
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow(windowSettings,startUrl);
  // Init internal teams list
  init.initTeams(path.join(__dirname, "..", "logic", "src", "json","teams.json")).then((finalTeams) => {
    internalTeams = finalTeams;
  });
  if (process.platform == "win32") {
    app.setAppUserModelId("Spectator");
  }
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(windowSettings,startUrl);
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
ipcMain.handle("close-Window", (event) => {
  mainWindow.close();
});

ipcMain.handle("minimize-Window", (event) => {
  mainWindow.minimize();
});

ipcMain.handle("maximize-Window", (event) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  
});

ipcMain.handle("invoke-Notification-With-Sound", (events, args) => {
  if (args?.["stop"]) {
    audioWindow.loadURL(path.join(__dirname, "..", `audio.html?stop=${args["stop"]}`));  
  } else {
    // Play audio
    audioWindow.loadURL(path.join(__dirname, "..", `audio.html?volume=${args["volume"]}&src=src/assets/audio/${args["audio"]}&length=${args["length"]}`));
    // Send notification
    let iconpath = path.join(__dirname, "..", `src/assets/logos/${args["logo"]}`);
    let notif = new Notification({
      title: args["title"],
      body: args["msg"],
      icon: iconpath,
      silent: true 
    });
    notif.show();
    // Automatically close notification after audio stops playing
    setTimeout(() => {
      notif.close();
    },args["length"]);
  }
});

ipcMain.handle("get-Internal-Teams", (events, args) => {
  return internalTeams;
})

ipcMain.handle("create-Game", (events, args) => {
  let gameProm = game.createGame(args["id"], internalTeams);
  gameProm.then((res) => {
    gamesData[res["id"]] = res;
  }).catch((err) => {
    console.log(err);
  })
  return gameProm;
});

ipcMain.handle("update-Game", (events, args) => {
  let id = args?.["id"];
  if (!id) {
    return new Promise((resolve,reject) => {reject({"errorMessage": "Game id not provided"})});
  } else {
    let updateProm = game.updateGameStatus(gamesData[id]);
    updateProm.then((res) => {
      gamesData[res["id"]] = res;
    }).catch((err) => {
      console.log(err);
    })
    return updateProm;
  }
  
});

ipcMain.handle("get-Games", (events, args) => {
  if (!args?.["date"]) {
    return new Promise((resolve,reject) => {reject({"errorMessage": "No date provided"})});
  } else if (!util.checkDateFormat(String(args["date"]))) {
    return new Promise((resolve,reject) => {reject({"errorMessage": "Incorret date format. Correct format is YYYY-MM-DD"})});
  } else {
    if (args?.["reset"] == true) {
      gamesData = {};
    }
    return game.findGames(args["date"]);
  }
})
