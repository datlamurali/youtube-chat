import React, { useState } from "react";
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
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* Video Player - 80% */}
      <div className="h-[80vh]">
        <VideoPlayer videoUrl={videoUrl} onVideoChange={setVideoUrl} />
      </div>

      {/* Bottom 20% - Tap to reveal chat */}
      <div className="h-[20vh] relative">
        {!chatVisible ? (
          <div
            className="h-full w-full bg-black flex items-center justify-center text-white text-sm cursor-pointer"
            onClick={() => setChatVisible(true)}
          >
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
