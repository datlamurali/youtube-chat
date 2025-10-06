import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalSettingsContext = createContext();

const defaultTextboxColor = {
  name: "Classic Light",
  border: "#CCCCCC",
  background: "#FFFFFF",
  font: "#333333"
};

const defaultAiPanelHeight = "187.50px";

const defaultPresets = [
  defaultTextboxColor,
  {
    name: "Midnight",
    border: "#444444",
    background: "#1A1A1A",
    font: "#E0E0E0"
  },
  {
    name: "Sea Shell",
    border: "#fbe8ea",
    background: "#fbe8ea",
    font: "#000000"
  },
  {
    name: "Dark Brown",
    border: "#5b3d3b",
    background: "#5b3d3b",
    font: "#FFFFFF"
  },
  {
    name: "Licorce",
    border: "#9c717f",
    background: "#9c717f",
    font: "#FFFFFF"
  }
];

export function GlobalSettingsProvider({ children }) {
  // Load persisted settings
  const [aiPanelHeight, setAiPanelHeight] = useState(() =>
    localStorage.getItem("aiPanelHeight") || defaultAiPanelHeight
  );

  const [textboxColor, setTextboxColor] = useState(() =>
    JSON.parse(localStorage.getItem("textboxColor")) || defaultTextboxColor
  );

  const [pendingColor, setPendingColor] = useState(textboxColor);
  const [userPresets, setUserPresets] = useState([]);

  const colorPresets = [...defaultPresets, ...userPresets];

  // Persist settings on change
  useEffect(() => {
    localStorage.setItem("textboxColor", JSON.stringify(textboxColor));
  }, [textboxColor]);

  useEffect(() => {
    localStorage.setItem("aiPanelHeight", aiPanelHeight);
  }, [aiPanelHeight]);

  const resetSettings = () => {
    setAiPanelHeight(defaultAiPanelHeight);
    setTextboxColor(defaultTextboxColor);
    setPendingColor(defaultTextboxColor);
    localStorage.removeItem("textboxColor");
    localStorage.removeItem("aiPanelHeight");
  };

  return (
    <GlobalSettingsContext.Provider
      value={{
        aiPanelHeight,
        setAiPanelHeight,
        textboxColor,
        setTextboxColor,
        pendingColor,
        setPendingColor,
        colorPresets,
        setUserPresets,
        resetSettings
      }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
