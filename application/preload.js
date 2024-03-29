const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    invokeNotificationWithSound: (args) => ipcRenderer.invoke("invoke-Notification-With-Sound",args),
    getInternalTeams: (args) => {return ipcRenderer.invoke("get-Internal-Teams", args)},
    createGame: (args) => {return ipcRenderer.invoke("create-Game", args)},
    updateGame: (args) => {return ipcRenderer.invoke("update-Game", args)},
    getGamesList: (args) => {return ipcRenderer.invoke("get-Games", args)},
    closeWindow: () => ipcRenderer.invoke("close-Window"),
    minimizeWindow: () => ipcRenderer.invoke("minimize-Window"),
    maximizeWindow: () => ipcRenderer.invoke("maximize-Window")
});
