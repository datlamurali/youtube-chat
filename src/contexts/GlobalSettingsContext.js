import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalSettingsContext = createContext();

export const GlobalSettingsProvider = ({ children }) => {
  const [aiPanelHeight, setAiPanelHeight] = useState("187.50px");
  const [textboxColor, setTextboxColor] = useState({
    border: "#FFFFFF",
    background: "#000000",
    font: "#FFFFFF"
  });
  const [pendingColor, setPendingColor] = useState(textboxColor);
  const [colorPresets, setColorPresets] = useState([]);
  const [wakeWords, setWakeWords] = useState(["wake up"]);
  const [closeWords, setCloseWords] = useState(["close chat"]);
  const [maxRestartAttempts, setMaxRestartAttempts] = useState(3);

  useEffect(() => {
    const storedWake = localStorage.getItem("wakeWords");
    const storedClose = localStorage.getItem("closeWords");
    const storedMax = localStorage.getItem("maxRestartAttempts");

    if (storedWake) setWakeWords(JSON.parse(storedWake));
    if (storedClose) setCloseWords(JSON.parse(storedClose));
    if (storedMax) setMaxRestartAttempts(parseInt(storedMax));
  }, []);

  const resetSettings = () => {
    setAiPanelHeight("187.50px");
    setTextboxColor({
      border: "#FFFFFF",
      background: "#000000",
      font: "#FFFFFF"
    });
    setPendingColor({
      border: "#FFFFFF",
      background: "#000000",
      font: "#FFFFFF"
    });
    setWakeWords(["wake up"]);
    setCloseWords(["close chat"]);
    setMaxRestartAttempts(3);
    localStorage.clear();
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
        setColorPresets,
        resetSettings,
        wakeWords,
        setWakeWords,
        closeWords,
        setCloseWords,
        maxRestartAttempts,
        setMaxRestartAttempts
      }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
