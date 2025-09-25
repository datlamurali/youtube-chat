import React, { useState } from "react";
import YouTube from "react-youtube";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Play, Settings, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoPlayer({ videoUrl, onVideoChange }) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState("");

  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      } else if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1);
      }
    } catch {
      return null;
    }
  };

  const videoId = extractVideoId(videoUrl) || "6pxRHBw-k8M";

  const handleUrlSubmit = () => {
    if (tempUrl.trim()) {
      onVideoChange(tempUrl);
      setShowUrlInput(false);
      setTempUrl("");
    }
  };

  const onReady = (event) => {
    event.target.setPlaybackQuality("hd2160");
  };

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      playsinline: 1,
      rel: 0,
      modestbranding: 0,
      autohide: 1,
      showinfo: 1,
      fs: 1,
      vq: "hd2160"
    }
  };

  return (
    <div className="relative h-full bg-slate-900 rounded-b-3xl overflow-hidden shadow-2xl">
      {videoId ? (
        <YouTube videoId={videoId} opts={opts} onReady={onReady} className="w-full h-full" />
      ) : (
        <div className="h-full flex items-center justify-center text-white">
          <div className="text-center">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-light">Enter a YouTube URL to start</p>
          </div>
        </div>
      )}

      {/* Settings and Close Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        {!showUrlInput && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowUrlInput(true)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </motion.div>
        )}

        {showUrlInput && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => setShowUrlInput(false)}
              className="text-white hover:text-red-400 p-2 rounded-full border border-white/20 shadow-md backdrop-blur-sm"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* URL Input Panel */}
      {showUrlInput && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50 z-40"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="flex-1 border-slate-200 focus:border-blue-400"
              onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button
              onClick={handleUrlSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
            >
              Load
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}