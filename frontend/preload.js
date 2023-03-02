const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    invokeNotificationWithSound: (args) => ipcRenderer.invoke("invoke-Notification-With-Sound",args),
});
