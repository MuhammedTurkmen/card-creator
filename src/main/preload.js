const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveTemplate: (templateData) =>
    ipcRenderer.invoke("save-template", templateData),
  loadTemplate: () => ipcRenderer.invoke("load-template"),
  exportImage: (dataUrl, fileName) =>
    ipcRenderer.invoke("export-image", { dataUrl, fileName }),
  exportPDF: (pdfData, fileName) =>
    ipcRenderer.invoke("export-pdf", { pdfData, fileName }),
});
