// src/renderer/services/electronBridge.js

class ElectronBridge {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
  }

  async saveTemplate(templateData) {
    if (this.isElectron) {
      // Electron'da dosya sistemi kullan
      return await window.electronAPI.saveTemplate(templateData);
    } else {
      // Web'de tarayıcı indirme kullan
      const dataStr = JSON.stringify(templateData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${templateData.name || "template"}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      return { success: true, filePath: exportFileDefaultName };
    }
  }

  async loadTemplate() {
    if (this.isElectron) {
      // Electron'da dosya sistemi kullan
      return await window.electronAPI.loadTemplate();
    } else {
      // Web'de dosya yükleme kullan
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
          const file = e.target.files[0];
          const reader = new FileReader();

          reader.onload = (event) => {
            try {
              const template = JSON.parse(event.target.result);
              resolve({ success: true, template });
            } catch (error) {
              resolve({ success: false, error: "Geçersiz JSON dosyası" });
            }
          };

          reader.readAsText(file);
        };

        input.click();
      });
    }
  }

  async exportImage(dataUrl, fileName) {
    if (this.isElectron) {
      // Electron'da dosya kaydetme
      return await window.electronAPI.exportImage(dataUrl, fileName);
    } else {
      // Web'de tarayıcı indirme kullan
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUrl);
      linkElement.setAttribute("download", fileName);
      linkElement.click();

      return { success: true, filePath: fileName };
    }
  }

  async exportPDF(pdfData, fileName) {
    if (this.isElectron) {
      // Electron'da PDF kaydetme
      return await window.electronAPI.exportPDF(pdfData, fileName);
    } else {
      // Web'de PDF indirme
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", pdfData);
      linkElement.setAttribute("download", fileName);
      linkElement.click();

      return { success: true, filePath: fileName };
    }
  }
}

export default new ElectronBridge();
