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
  const [micEnabled, setMicEnabled] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const {
    aiPanelHeight,
    wakeWords,
    closeWords,
    maxRestartAttempts
  } = useGlobalSettings();

  useEffect(() => {
    console.log("🔍 isListening changed:", isListening);
  }, [isListening]);
  
  useEffect(() => {
    if (micActive) {
      stopListening(true);
    } else{
      setTimeout(() => {
        console.log("🔄 Restarting recognition after AI response");
        if (!isListening) {
          startListening();
        }
      }, 8000);
    }
  }, [micActive]);



  const { startListening, stopListening } = useSpeechRecognizer({
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
      setMicActive(false); // ✅ allow recognition to resume
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
    maxRestarts: maxRestartAttempts,
    micActive,
    onResumeListening: () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  });

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

  const panelHeight = aiPanelHeight || "245.9px";
  const videoHeight = `${viewportHeight - parseFloat(panelHeight)}px`;

  return (
    <div className="w-screen flex flex-col bg-black overflow-hidden" style={{ height: `${viewportHeight}px` }}>
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
      {showToast && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow-md text-sm font-medium">
          🔊 Voice listening resumed…
        </div>
      )}

      {/* Video Player fills remaining space above chat */}
      <div style={{ height: videoHeight }}>
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
                onClose={() => {
                  setChatVisible(false);
                  setMicActive(false);
                }}
                stopListening={stopListening}
                setMicActive={setMicActive}
              />
        )}
      </div>
    </div>
  );
}
