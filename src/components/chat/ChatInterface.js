import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Loader2, XCircle } from "lucide-react";
import { InvokeLLM } from "../../integrations/Core";
import MessageBubble from "./MessageBubble";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ChatInterface({ messages, onSendMessage, onClose }) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    onSendMessage(userMessage, false);
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        prompt: `You are ChatGPT, a large language model by OpenAI. You are having a friendly and helpful conversation with a user who is watching a YouTube video. Keep your responses concise and engaging. User's message: "${userMessage}"`
      });

      onSendMessage(response, true);
    } catch (error) {
      onSendMessage("I'm sorry, I encountered an error. Please try again!", true);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus(); // Refocus input
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full bg-black border-t border-slate-200/50">
      {/* Stylish Close Button */}
      <div className="absolute top-2 right-4 z-[10000]">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:text-red-400 p-2 rounded-full border border-white/20 shadow-md backdrop-blur-sm"
        >
          <XCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat History */}
      <div className="h-[calc(20vh-64px)] overflow-y-auto px-4 pt-8 pb-2 space-y-3">
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
                <span className="text-sm">ChatGPT is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-950 p-4 z-[10000]">
        <div className="flex gap-3 items-end w-full max-w-full box-border">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="bg-slate-950 text-slate-50 px-4 py-3 text-base h-12 w-full border border-slate-200 focus:border-blue-400 rounded-2xl resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isLoading}
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
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