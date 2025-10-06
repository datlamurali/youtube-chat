import React, { useState, useEffect } from "react";
import VideoPlayer from "../components/video/VideoPlayer";
import ChatInterface from "../components/chat/ChatInterface";
import { useGlobalSettings } from "../contexts/GlobalSettingsContext";

export default function VideoChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Corning: Unparalleled Expertise. Chat with me here!",
      isAi: true,
      timestamp: new Date()
    }
  ]);

  const [videoUrl, setVideoUrl] = useState("https://youtu.be/F0QyPFRKllQ");
  const [chatVisible, setChatVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const { aiPanelHeight } = useGlobalSettings();

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addMessage = (text, isAi = false) => {
    const newMessage = {
      id: Date.now(),
      text,
      isAi,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const panelHeight = aiPanelHeight || "187.50px";
  const videoHeight = `${viewportHeight - parseFloat(panelHeight)}px`;

  return (
    <div className="w-screen flex flex-col bg-black overflow-hidden" style={{ height: `${viewportHeight}px` }}>
      {/* Video Player fills remaining space above chat */}
      <div style={{ height: videoHeight }}>
        <VideoPlayer videoUrl={videoUrl} onVideoChange={setVideoUrl} />
      </div>

      {/* Chat Panel */}
      <div className="relative" style={{ height: panelHeight }}>
        {!chatVisible ? (
          <div
            className="h-full w-full bg-black flex items-center justify-center text-white text-sm cursor-pointer"
            onClick={() => setChatVisible(true)}
          >
            <span></span>
          </div>
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={addMessage}
            onClose={() => setChatVisible(false)}
          />
        )}
      </div>
    </div>
  );
}
