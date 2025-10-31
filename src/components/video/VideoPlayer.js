import React, { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { Button } from "../ui/button";
import { Play, Settings } from "lucide-react";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";
import SettingsPanel from "../ui/SettingsPanel";

export default function VideoPlayer({ videoUrl, onVideoChange, onPlay }) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [previewInChat, setPreviewInChat] = useState(false);
  const settingsRef = useRef(null);

  const {
    aiPanelHeight,
    textboxColor,
    pendingColor,
    colorPresets,
    setTextboxColor,
    setPendingColor,
    setColorPresets,
    setAiPanelHeight,
    resetSettings,
    setUserPresets
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
  const panelHeight = aiPanelHeight || "245.9px";

  const handleUrlSubmit = () => {
    if (tempUrl.trim()) {
      onVideoChange(tempUrl);
      setTempUrl("");
    }
  };

  const savePreset = () => {
    const normalize = (hex) => hex.toUpperCase();
    const normalizedPreset = {
      border: normalize(pendingColor.border),
      background: normalize(pendingColor.background),
      font: normalize(pendingColor.font)
    };
    setUserPresets((prev) => [...prev, normalizedPreset]);
  };

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
      <div className="relative w-full h-full" onContextMenu={(e) => e.preventDefault()}>
        {finalVideoId ? (
          <>
            <YouTube
              videoId={finalVideoId}
              className="w-full h-full"
              iframeClassName="w-full h-full"
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  disablekb: 1,
                  fs: 0,
                  iv_load_policy: 3
                }
              }}
              onReady={(event) => {
                event.target.mute();
                event.target.playVideo();
                if (typeof onPlay === "function") {
                  console.log("▶️ Video is playing — triggering voice activation");
                  onPlay(); // ✅ Trigger voice activation
                }
              }}
            />
            {/* Transparent overlay to suppress long-press */}
            <div
              className="absolute top-0 left-0 w-full h-full"
              onTouchStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            />
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <Play className="w-16 h-16 opacity-50" />
            <p className="text-xl font-light ml-4">Enter a YouTube URL to start</p>
          </div>
        )}
      </div>

      {/* Settings Button */}
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
