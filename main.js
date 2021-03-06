const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');
const isDev = require("electron-is-dev");

// Enable auto downloading
// Start installing process when the update download is complete and app is closed
autoUpdater.autoInstallOnAppQuit = true;
// Check latest releases on GitHub
log.transports.file.level = "info"
autoUpdater.logger = log
let mainWindow;
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';

// autoUpdater.checkForUpdatesAndNotify()
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false, // turn off remote
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  process.env.GH_TOKEN = "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";
    autoUpdater.autoDownload = false;
    
  mainWindow.once('ready-to-show', () => {
     isDev?autoUpdater.checkForUpdates(): autoUpdater.checkForUpdatesAndNotify();
  });
}
autoUpdater.setFeedURL("https://github.com/esraahusamia/auto-update-demo.git")
setInterval(() => {
  isDev?autoUpdater.checkForUpdates(): autoUpdater.checkForUpdatesAndNotify();
}, 6000);

app.on('ready', () => {
      createWindow();
});

    app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

    app.on('activate', function () {
  if (mainWindow === null) {
      createWindow();
  }
});

ipcMain.on('app_version', (event) => {
      console.log(app.getVersion())
  event.sender.send('app_version', {version: app.getVersion() });
});
/**
 * Checking if update has started.
 */
 autoUpdater.on("checking-for-update", () => {
      log.info("Checking for update...");
});

/**
 * Checking if there is no update available.
 */
autoUpdater.on("update-not-available", () => {
      log.info("Update not available.");
});

/**
 * There is an update available.
 */
autoUpdater.on("update-available", (updateInfo) => {
      log.info("Update available.");
    // Send a notification to the renderer
    mainWindow.webContents.send("update_available");
});

/**
 * Current download progress.
 */
autoUpdater.on("download-progress", (progressInfo) => {
      // Send download progress data to the renderer
      mainWindow.webContents.send("download-progress", {
        percent: progressInfo.percent,
        transferred: progressInfo.transferred,
        total: progressInfo.total
      });
});

/**
 * Update is downloaded successfully.
 */
autoUpdater.on("update-downloaded", (updateInfo) => {
      log.info("Update downloaded.");
    // Quit and install the updates
    autoUpdater.quitAndInstall(true, true);
});