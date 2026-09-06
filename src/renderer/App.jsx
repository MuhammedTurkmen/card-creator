import React, { useState, useRef } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import electronBridge from "./services/electronBridge";
import "./styles/main.css";

const App = () => {
  const stageRef = useRef(null);
  const [template, setTemplate] = useState({
    name: "Fantezi Kart",
    width: 750,
    height: 1050,
    layers: [
      {
        id: "background",
        type: "rect",
        x: 0,
        y: 0,
        width: 750,
        height: 1050,
        fill: "#2c3e50",
        stroke: "#34495e",
        strokeWidth: 5,
        cornerRadius: 20,
      },
      {
        id: "title",
        type: "text",
        x: 50,
        y: 30,
        text: "{card_name}",
        fontSize: 40,
        fontFamily: "Arial",
        fill: "#ecf0f1",
        align: "center",
        width: 650,
      },
      {
        id: "stats",
        type: "text",
        x: 50,
        y: 900,
        text: "ATK: {attack} | HP: {health}",
        fontSize: 30,
        fontFamily: "Arial",
        fill: "#e74c3c",
        align: "center",
        width: 650,
      },
    ],
  });

  const [cardData, setCardData] = useState({
    card_name: "Ejderha",
    attack: 7,
    health: 7,
  });

  const replaceVariables = (text) => {
    return text.replace(/\{(\w+)\}/g, (match, variable) => {
      return cardData[variable] || match;
    });
  };

  const saveTemplate = async () => {
    const result = await electronBridge.saveTemplate(template);
    if (result.success) {
      alert("Şablon kaydedildi!");
    }
  };

  const loadTemplate = async () => {
    const result = await electronBridge.loadTemplate();
    if (result.success) {
      setTemplate(result.template);
      alert("Şablon yüklendi!");
    }
  };

  const exportAsImage = async () => {
    const stage = stageRef.current;
    if (stage) {
      const dataUrl = stage.toDataURL({ pixelRatio: 3 });
      const fileName = `${cardData.card_name || "card"}.png`;
      const result = await electronBridge.exportImage(dataUrl, fileName);
      if (result.success) {
        alert("Kart dışa aktarıldı!");
      }
    }
  };

  return (
    <div className="app">
      <header className="toolbar">
        <h1>Card Creator</h1>
        <div className="toolbar-buttons">
          <button onClick={saveTemplate}>💾 Kaydet</button>
          <button onClick={loadTemplate}>📂 Yükle</button>
          <button onClick={exportAsImage}>🖼️ PNG İndir</button>
        </div>
        <div className="environment-badge">
          {electronBridge.isElectron ? "🖥️ Masaüstü" : "🌐 Web"}
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h3>Kart Verileri</h3>
          <div className="card-data">
            <label>
              Kart Adı:
              <input
                type="text"
                value={cardData.card_name}
                onChange={(e) =>
                  setCardData({ ...cardData, card_name: e.target.value })
                }
              />
            </label>
            <label>
              Saldırı (ATK):
              <input
                type="number"
                value={cardData.attack}
                onChange={(e) =>
                  setCardData({ ...cardData, attack: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Sağlık (HP):
              <input
                type="number"
                value={cardData.health}
                onChange={(e) =>
                  setCardData({ ...cardData, health: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <h3>Şablon Bilgileri</h3>
          <div className="template-info">
            <p>Ad: {template.name}</p>
            <p>
              Boyut: {template.width}x{template.height}
            </p>
            <p>Katman Sayısı: {template.layers.length}</p>
          </div>
        </aside>

        <div className="canvas-area">
          <Stage
            ref={stageRef}
            width={template.width}
            height={template.height}
            scale={{ x: 0.7, y: 0.7 }}
          >
            <Layer>
              {template.layers.map((layer) => {
                if (layer.type === "rect") {
                  return <Rect key={layer.id} {...layer} />;
                } else if (layer.type === "text") {
                  return (
                    <Text
                      key={layer.id}
                      {...layer}
                      text={replaceVariables(layer.text)}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default App;
