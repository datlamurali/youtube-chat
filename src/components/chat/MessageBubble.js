import React from "react";
import { motion } from "framer-motion";
import { Aperture, User } from "lucide-react";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";

export default function MessageBubble({ message }) {
  const { text, isAi, timestamp } = message;
  const { textboxColor } = useGlobalSettings();

  const safeColor = {
    border: textboxColor?.border || "#FFFFFF",
    background: textboxColor?.background || "#000000",
    font: textboxColor?.font || "#FFFFFF"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
    >
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Aperture className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`px-4 py-3 rounded-2xl shadow-sm border max-w-[80%] ${
          isAi ? "rounded-bl-md" : "rounded-br-md"
        }`}
        style={{
          border: `2px solid ${isAi ? safeColor.border : "#94a3b8"}`,
          backgroundColor: isAi ? safeColor.background : "#1e293b",
          color: isAi ? safeColor.font : "#e2e8f0"
        }}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        <div className="text-xs text-slate-400 mt-1 text-right">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>

      {!isAi && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
}
