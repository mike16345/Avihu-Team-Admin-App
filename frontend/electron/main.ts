import { app, BrowserWindow } from "electron";
import path from "node:path";
import Logger from "electron-log";
import {
  initBackgroundProcesses,
  killBackgroundProcesses,
} from "./BackgroundProcesses";

// Replace '/path/to/your/directory' with the path to the directory you want to print
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │

// Current date
const currentDateTime = new Date();

const year = currentDateTime.getFullYear();
const month = currentDateTime.getMonth() + 1;
const day = currentDateTime.getDate();

const hours = currentDateTime.getHours();
const minutes = currentDateTime.getMinutes();

const fullDate = `${day < 10 ? "0" + day : day}-${
  month < 10 ? "0" + month : month
}-${year}-${hours < 10 ? "0" + hours : hours}-${
  minutes < 10 ? "0" + minutes : minutes
}`;

// Set logger file path
Logger.transports.file.resolvePathFn = () =>
  path.join(
    `${process.env.HOME}/Workout-Training-Admin/frontend/electron/logs`,
    `logs-${fullDate}.log`
  );
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 850,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    killBackgroundProcesses();
    app.quit();
    win = null;
  }
});

process.on("exit", function () {
  killBackgroundProcesses();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  console.log('Logger',Logger);

  initBackgroundProcesses();
  createWindow();
});

