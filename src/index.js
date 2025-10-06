import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import VideoChat from "./pages/VideoChat";
import { GlobalSettingsProvider } from "./contexts/GlobalSettingsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GlobalSettingsProvider>
      <VideoChat />
    </GlobalSettingsProvider>
  </React.StrictMode>
);
