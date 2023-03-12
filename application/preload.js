const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    invokeNotificationWithSound: (args) => ipcRenderer.invoke("invoke-Notification-With-Sound",args),
    getInternalTeams: (args) => {return ipcRenderer.invoke("get-Internal-Teams", args)},
    createGame: (args) => {return ipcRenderer.invoke("create-Game", args)},
    getGamesList: (args) => {return ipcRenderer.invoke("get-Games", args)},
    
});
