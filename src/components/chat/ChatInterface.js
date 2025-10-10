import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, XCircle, Mic, ArrowRight } from "lucide-react";
import { InvokeLLM } from "../../integrations/Core";
import MessageBubble from "./MessageBubble";
import { motion } from "framer-motion";
import { useGlobalSettings } from "../../contexts/GlobalSettingsContext";

export default function ChatInterface({ messages, onSendMessage, onClose }) {
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

  // ✅ Updated to accept optional overrideText
  const handleSend = async (overrideText) => {
    const message = overrideText ?? inputText.trim();
    if (!message || isLoading) return;

    setInputText("");
    onSendMessage(message, false);
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        prompt: `You are ChatGPT, a large language model by OpenAI. You are having a friendly and helpful conversation with a user who is watching a YouTube video. Keep your responses concise and engaging. User's message: "${message}"`
      });

      onSendMessage(response, true);
    } catch (error) {
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

    // ✅ Updated to pass transcript directly to handleSend
  const handleVoiceInput = () => {
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

      // ✅ Delay sending by 5 seconds
      setTimeout(() => {
        handleSend(transcript);
      }, 2500);
    };

    recognition.onerror = () => setIsMicActive(false);
    recognition.onend = () => setIsMicActive(false);

    recognition.start();
  };



  const safeColor = {
    border: textboxColor?.border || "#FFFFFF",
    background: textboxColor?.background || "#000000",
    font: textboxColor?.font || "#FFFFFF"
  };

  return (
    <div className="h-full w-full bg-black border-t border-slate-200/50 flex flex-col relative">
      {/* Close + Mic Buttons */}
      <div className="absolute top-2 right-4 z-50 flex flex-col items-center gap-3">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:text-red-400 p-3 rounded-full border border-white/20 shadow-md backdrop-blur-sm"
        >
          <XCircle className="w-6 h-6" />
        </Button>

        <Button
          onClick={handleVoiceInput}
          className={`p-3 rounded-full shadow-md ${
            isMicActive ? "bg-red-600 hover:bg-red-500" : "bg-slate-800 hover:bg-slate-700"
          } text-white`}
          title="Voice Input"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-2 space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">SmartChat is processing your request...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-950 p-4 z-40">
        <div className="flex gap-3 items-end w-full max-w-full box-border">
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
              className={`px-4 py-3 text-base h-12 w-full rounded-2xl resize-none focus:outline-none placeholder-opacity-100`}
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
