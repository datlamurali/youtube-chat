import React, { useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SketchPicker } from "react-color";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";
import DropdownColorPicker from "./DropdownColorPicker";

export default function SettingsPanel({
  onClose,
  tempUrl,
  setTempUrl,
  handleUrlSubmit,
  previewInChat,
  setPreviewInChat,
  savePreset,
  applyPreset
}) {
  const settingsRef = useRef(null);
  const {
    aiPanelHeight,
    setAiPanelHeight,
    textboxColor,
    setTextboxColor,
    pendingColor,
    setPendingColor,
    colorPresets,
    resetSettings
  } = useGlobalSettings();

  const panelHeight = aiPanelHeight || "187.50px";

  const handleClickOutside = (e) => {
    if (settingsRef.current && !settingsRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <motion.div
        ref={settingsRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 text-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto space-y-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Settings</div>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
            title="Close Settings"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        <Button
          onClick={resetSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
        >
          Reset All Settings
        </Button>

        {/* YouTube URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
              className="w-full"
            />
            <Button
              onClick={handleUrlSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
            >
              Load
            </Button>
          </div>
        </div>

        {/* AI Panel Height */}
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Panel Height (px)</label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="125"
              max="250"
              step="0.01"
              value={parseFloat(panelHeight)}
              onChange={(e) => setAiPanelHeight(`${e.target.value}px`)}
              className="w-full"
            />
            <input
                type="number"
                step="0.01"
                min="125"
                max="250"
                value={parseFloat(panelHeight)}
                onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 125 && value <= 250) {
                    setAiPanelHeight(`${value.toFixed(2)}px`);
                    }
                }}
                className="w-24 px-2 py-1 border rounded text-black bg-white"
            />

          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["border", "background", "font"].map((key) => (
            <DropdownColorPicker
                key={key}
                label={key}
                color={pendingColor[key]}
                fontColor={pendingColor.font}
                onChange={(hex) =>
                setPendingColor((prev) => ({ ...prev, [key]: hex }))
                }
            />
            ))}
        </div>

        {/* Preview and Apply */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Textbox Preview</label>
          <div
            className="rounded-2xl px-4 py-3 max-w-md mb-2"
            style={{
              border: `2px solid ${pendingColor.border}`,
              backgroundColor: pendingColor.background,
              color: pendingColor.font
            }}
          >
            Ask me anything...
          </div>
          <div className="flex gap-2">
            <Button
                onClick={() => {
                    setTextboxColor(pendingColor);
                    localStorage.setItem("textboxColor", JSON.stringify(pendingColor));
                    localStorage.setItem("aiPanelHeight", aiPanelHeight);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
                >
                Apply Textbox Style
            </Button>
            <Button
              onClick={savePreset}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
            >
              Save as Preset
            </Button>
          </div>
        </div>

        {/* Presets */}
        {colorPresets.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Saved Presets</label>
            <div className="flex gap-2 flex-wrap mt-2">
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
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
