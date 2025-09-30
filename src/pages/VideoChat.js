import React, { useState, useEffect } from "react";
import VideoPlayer from "../components/video/VideoPlayer";
import ChatInterface from "../components/chat/ChatInterface";

export default function VideoChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Corning: Unparalleled Expertise. Chat with me here!",
      isAi: true,
      timestamp: new Date()
    }
  ]);

  const [videoUrl, setVideoUrl] = useState("https://youtu.be/6pxRHBw-k8M");
  const [chatVisible, setChatVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

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

  return (
    <div
      className="w-screen flex flex-col bg-black overflow-hidden"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* Video Player - fills remaining space above chat */}
      <div className="flex-1 min-h-0">
        <VideoPlayer videoUrl={videoUrl} onVideoChange={setVideoUrl} />
      </div>

      {/* Chat Interface - fixed to 49.6mm (~187.5px) */}
      <div className="relative" style={{ height: "187.5px" }}>
        {!chatVisible ? (
          <div
            className="h-full w-full bg-black flex items-center justify-center text-white text-sm cursor-pointer"
            onClick={() => setChatVisible(true)}
          >
            Tap to chat
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
