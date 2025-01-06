const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Required for local file access
      allowRunningInsecureContent: true, // Required for some Hydra features
    },
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  // Open the DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Handle WebGL context loss
  mainWindow.webContents.on("context-lost", () => {
    console.log("WebGL context lost. Reloading...");
    mainWindow.reload();
  });

  // Remove the menu bar
  mainWindow.setMenuBarVisibility(false);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Enable hardware acceleration
  app.commandLine.appendSwitch("enable-accelerated-mjpeg-decode");
  app.commandLine.appendSwitch("enable-accelerated-video");
  app.commandLine.appendSwitch("ignore-gpu-blacklist");
  app.commandLine.appendSwitch("enable-gpu-rasterization");
  app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle saving snippets
ipcMain.on("save-snippet", (event, data) => {
  const snippets = store.get("snippets") || [];
  snippets.push(data);
  store.set("snippets", snippets);
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

app.on("render-process-gone", (event, webContents, details) => {
  console.error("Render process gone:", details);
});
