import React, { useState, useEffect } from "react";
import VideoPlayer from "../components/video/VideoPlayer";
import ChatInterface from "../components/chat/ChatInterface";
import { useGlobalSettings } from "../contexts/GlobalSettingsContext";
import useSpeechRecognizer from "../hooks/useSpeechRecognizer";
import { InvokeLLM } from "../integrations/Core";

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
  const [showToast, setShowToast] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const {
    aiPanelHeight,
    wakeWords,
    closeWords,
    maxRestartAttempts
  } = useGlobalSettings();

  const { startListening } = useSpeechRecognizer({
    onWakeWord: () => {
      console.log("✅ Wake word detected — opening chat");
      setChatVisible(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onVoiceInput: async (transcript) => {
      const userMessage = {
        id: Date.now(),
        text: transcript,
        isAi: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await InvokeLLM({
        prompt: `You are ChatGPT, an AI developed by OpenAI. You're engaging in a friendly and insightful conversation with a user who is watching a YouTube video. The context involves a professional and cordial dialogue between executives from Corning and Amazon. Keep your responses concise, engaging, and aligned with the tone of a thoughtful business exchange. User's message: "${transcript}"`
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isAi: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onCloseChat: () => {
      console.log("❎ Close word detected — closing chat");
      setChatVisible(false);
    },
    isChatOpen: chatVisible,
    setIsListening,
    wakeWords,
    closeWords,
    maxRestarts: maxRestartAttempts
  });

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const panelHeight = aiPanelHeight || "187.50px";
  const videoHeight = `${viewportHeight - parseFloat(panelHeight)}px`;

  return (
    <div className="w-screen flex flex-col bg-black overflow-hidden relative" style={{ height: `${viewportHeight}px` }}>
      {/* Listening Indicator */}
      {isListening && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-full shadow-md border border-white/10 backdrop-blur-sm animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v3m0-3a6 6 0 006-6V9a6 6 0 10-12 0v3a6 6 0 006 6z"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide">Listening…</span>
        </div>
      )}

      {/* Video Player */}
      <div style={{ height: videoHeight }} className="w-full">
        <VideoPlayer
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          onPlay={() => {
            console.log("▶️ Video started — activating voice");
            startListening();
          }}
        />
      </div>

      {/* Bottom Panel — Tap to Open Chat */}
      <div
        className="relative w-full bg-black"
        style={{ height: panelHeight }}
        onClick={() => {
          if (!chatVisible) {
            console.log("👆 Tap detected on bottom panel — opening chat");
            setChatVisible(true);
          }
        }}
      >
        {chatVisible && (
          <ChatInterface
            messages={messages}
            onSendMessage={(text, isAi) => {
              const newMessage = {
                id: Date.now(),
                text,
                isAi,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, newMessage]);
            }}
            onClose={() => setChatVisible(false)}
          />
        )}
      </div>
    </div>
  );
}
