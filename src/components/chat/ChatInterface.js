import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, XCircle, Mic, ArrowRight } from "lucide-react";
import { InvokeLLM } from "../../integrations/Core";
import MessageBubble from "./MessageBubble";
import { motion } from "framer-motion";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";

export default function ChatInterface({ messages, onSendMessage, onClose, stopListening, setMicActive }) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { textboxColor } = useGlobalSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText) => {
    const message = overrideText ?? inputText.trim();
    if (!message || isLoading) return;

    console.log("🟡 Sending message:", message);
    setInputText("");
    onSendMessage(message, false);
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        prompt: `You are ChatGPT, a large language model by OpenAI. You are having a friendly and helpful conversation with a user who is watching a YouTube video. Keep your responses concise and engaging. User's message: "${message}"`
      });

      console.log("🟢 AI response received:", response);
      onSendMessage(response, true);

      // ✅ Restart wake word listener here
      console.log("🔄 Restarting wake word listener after AI response");
      setMicActive(false); // This will trigger the effect in VideoChat to resume listening
    } catch (error) {
      console.error("❌ Error from InvokeLLM:", error);
      onSendMessage("I'm sorry, I encountered an error. Please try again!", true);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
  stopListening?.(true); // ✅ Stop and prevent auto-restart
  setMicActive(true);    // ✅ Block wake word listener

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsMicActive(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsMicActive(false);
      setMicActive(false); // ✅ Allow wake word listener to resume

      setTimeout(() => {
        handleSend(transcript);
      }, 2500);
    };

    recognition.onerror = () => {
      setIsMicActive(false);
      setMicActive(false); // ✅ Resume wake word listener
    };

    recognition.onend = () => {
      setIsMicActive(false);
      setMicActive(false); // ✅ Resume wake word listener
    };

    recognition.start();
  };

  const safeColor = {
    border: textboxColor?.border || "#FFFFFF",
    background: textboxColor?.background || "#000000",
    font: textboxColor?.font || "#FFFFFF"
  };

  return (
    <div className="h-full w-full bg-black border-t border-slate-200/50 flex flex-col relative">
      {/* Floating Button Stack */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-center space-y-4">
        {/* Close Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:text-red-400 p-3 rounded-full border border-white/20 shadow-md backdrop-blur-sm"
        >
          <XCircle className="w-8 h-8" />
        </Button>

        {/* Mic Button */}
        <Button
          onClick={handleVoiceInput}
          className={`p-3 rounded-full shadow-md ${
            isMicActive ? "bg-red-600 hover:bg-red-500" : "bg-slate-800 hover:bg-slate-700"
          } text-white`}
          title="Voice Input"
        >
          <Mic className="w-8 h-8" />
        </Button>
      </div>


      {/* Chat History */}
      <div className="flex-1 overflow-y-auto pt-24 pb-2 pr-20 pl-4 space-y-3 w-full">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex justify-start"
          >
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 rounded-2xl rounded-bl-md px-4 py-3 w-full max-w-full shadow-sm">
              <div className="flex items-center gap-4 text-slate-600">
                <img
                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2JmbDl2bW5zMGFhdXloaGFobHA1eHc5YjBiYThpM2g5b3R6bHU5MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fDkq28pQkslOfCrMiO/giphy.gif"
                  alt="Loading animation"
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">CorningChat is warming up…</span>
                  <span className="text-xs text-slate-500">Just a moment while we get things rolling 🛠️</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}



        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-950 p-4 z-40 w-full">
        <div className="flex gap-3 items-end w-full box-border">
          <motion.div layout className="flex-1">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              style={{
                border: `2px solid ${safeColor.border}`,
                backgroundColor: safeColor.background,
                color: safeColor.font
              }}
              className="px-4 py-3 text-base h-12 w-full rounded-2xl resize-none focus:outline-none placeholder-opacity-100"
              disabled={isLoading}
            />
          </motion.div>

          {/* Send Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 h-12"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
