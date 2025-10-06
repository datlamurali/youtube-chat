import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";

// Utility: luminance-based contrast check
function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

export default function DropdownColorPicker({ label, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const handleClickOutside = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColor = getContrastColor(color);

  return (
    <div className="relative space-y-1">
      <label className="text-sm font-medium capitalize">{label} Color</label>
      <div
        className="w-full h-10 rounded-md border cursor-pointer flex items-center justify-between px-3"
        style={{ backgroundColor: color, color: textColor }}
        onClick={() => setShowPicker((prev) => !prev)}
      >
        <span className="text-sm">{color}</span>
      </div>
      {showPicker && (
        <div ref={pickerRef} className="absolute z-50 mt-2 shadow-lg">
          <SketchPicker
            color={color}
            onChangeComplete={(c) => onChange(c.hex.toUpperCase())}
            disableAlpha
          />
        </div>
      )}
    </div>
  );
}
