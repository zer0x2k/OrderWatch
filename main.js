const { app, BrowserWindow } = require('electron')
const serve = require('electron-serve');
const loadURL = serve({ directory: 'www' });

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100, height: 900,
        webPreferences: {
            webSecurity: false
        }
    })
    loadURL(mainWindow).then(() => {
        mainWindow.loadURL('app://-');
    });
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    mainWindow.removeMenu();
}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})