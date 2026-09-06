const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs-extra");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Card Creator",
    backgroundColor: "#1a1a2e",
  });

  // Geliştirme modu kontrolü
  const isDev = !app.isPackaged;

  if (isDev) {
    // Geliştirme modunda Vite dev server'ı kullan
    mainWindow.loadURL("http://localhost:5173");
    // DevTools'u aç (isteğe bağlı)
    // mainWindow.webContents.openDevTools();
  } else {
    // Üretim modunda build edilmiş dosyaları yükle
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC handler'ları
ipcMain.handle("save-template", async (event, templateData) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Şablonu Kaydet",
    defaultPath: `${templateData.name || "template"}.json`,
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (!canceled && filePath) {
    await fs.writeJson(filePath, templateData, { spaces: 2 });
    return { success: true, filePath };
  }
  return { success: false };
});

ipcMain.handle("load-template", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Şablon Yükle",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
    properties: ["openFile"],
  });

  if (!canceled && filePaths.length > 0) {
    const template = await fs.readJson(filePaths[0]);
    return { success: true, template };
  }
  return { success: false };
});

ipcMain.handle("export-image", async (event, { dataUrl, fileName }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Görseli Kaydet",
    defaultPath: fileName || `card-${Date.now()}.png`,
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
  });

  if (!canceled && filePath) {
    // Base64 veriyi dosyaya yaz
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    await fs.writeFile(filePath, buffer);
    return { success: true, filePath };
  }
  return { success: false };
});

ipcMain.handle("export-pdf", async (event, { pdfData, fileName }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "PDF Kaydet",
    defaultPath: fileName || `cards-${Date.now()}.pdf`,
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
  });

  if (!canceled && filePath) {
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    await fs.writeFile(filePath, buffer);
    return { success: true, filePath };
  }
  return { success: false };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
