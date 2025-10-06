import React, { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Play, Settings, XCircle, RefreshCcw, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { SketchPicker } from "react-color";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";
import SettingsPanel from "../ui/SettingsPanel";

export default function VideoPlayer({ videoUrl, onVideoChange }) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [previewInChat, setPreviewInChat] = useState(false);
  const settingsRef = useRef(null);

  const {
    aiPanelHeight,
    setAiPanelHeight,
    textboxColor,
    setTextboxColor,
    pendingColor,
    setPendingColor,
    colorPresets,
    setColorPresets,
    resetSettings
  } = useGlobalSettings();

  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes("youtube.com")
        ? urlObj.searchParams.get("v")
        : urlObj.pathname.slice(1);
    } catch {
      return null;
    }
  };

  const videoId = extractVideoId(videoUrl);
  const fallbackId = "F0QyPFRKllQ";
  const finalVideoId = videoId || fallbackId;
  const panelHeight = aiPanelHeight || "187.50px";

  const handleUrlSubmit = () => {
    if (tempUrl.trim()) {
      onVideoChange(tempUrl);
      setTempUrl("");
    }
  };

  const { setUserPresets } = useGlobalSettings();

  const savePreset = () => {
    const normalize = (hex) => hex.toUpperCase();
    const normalizedPreset = {
      border: normalize(pendingColor.border),
      background: normalize(pendingColor.background),
      font: normalize(pendingColor.font)
    };
    setUserPresets((prev) => [...prev, normalizedPreset]);
  };

  {colorPresets.map((preset, i) => (
    <button
      key={i}
      onClick={() => applyPreset(preset)}
      className="w-10 h-10 rounded-full border-2"
      style={{
        backgroundColor: preset.background,
        borderColor: preset.border,
        color: preset.font
      }}
      title={preset.name || `Preset ${i + 1}`}
    >
      A
    </button>
  ))}


  const applyPreset = (preset) => {
    setPendingColor(preset);
    setTextboxColor(preset);
  };

  const handleClickOutside = (e) => {
    if (settingsRef.current && !settingsRef.current.contains(e.target)) {
      setShowSettings(false);
    }
  };

  useEffect(() => {
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Video or Fallback */}
      <div className="w-full h-full">
        {finalVideoId ? (
          <YouTube
            videoId={finalVideoId}
            className="w-full h-full"
            iframeClassName="w-full h-full"
            opts={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <Play className="w-16 h-16 opacity-50" />
            <p className="text-xl font-light ml-4">Enter a YouTube URL to start</p>
          </div>
        )}
      </div>

      {/* Settings Buttons */}
      <div className="absolute top-4 right-4 z-50">
        <Button onClick={() => setShowSettings(true)} className="bg-white/20 text-white">
          <Settings className="w-5 h-5" />
        </Button>
      </div>


      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          tempUrl={tempUrl}
          setTempUrl={setTempUrl}
          handleUrlSubmit={handleUrlSubmit}
          previewInChat={previewInChat}
          setPreviewInChat={setPreviewInChat}
          savePreset={savePreset}
          applyPreset={applyPreset}
        />
      )}

    </div>
  );
}
