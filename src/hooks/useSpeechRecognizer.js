import { useRef } from "react";

export default function useSpeechRecognizer({
  onWakeWord,
  onVoiceInput,
  isChatOpen,
  setIsListening,
  wakeWords = ["wake up"],
  closeWords = ["close chat"],
  onCloseChat,
  timeoutMs = 60000,
  maxRestarts = 3
}) {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartAttempts = useRef(0);
  const isRetrying = useRef(false);
  const shouldRestart = useRef(true); // ✅ new flag

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported.");
      return;
    }

    if (recognitionRef.current) {
      console.log("⛔ Already listening — aborting start");
      return;
    }

    if (!isRetrying.current) restartAttempts.current = 0;
    shouldRestart.current = true; // ✅ reset before each start

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      console.log("🎙️ Recognition started — waiting for wake word");

      silenceTimerRef.current = setTimeout(() => {
        console.log(`⏱️ Wake word not detected in ${timeoutMs / 1000}s — stopping`);
        recognition.stop();
      }, timeoutMs);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        console.log("🗣️ Heard:", transcript);

        if (wakeWords.some((word) => transcript.includes(word))) {
          console.log(`✅ Wake word detected`);
          clearTimeout(silenceTimerRef.current);
          shouldRestart.current = true; // ✅ allow restart
          onWakeWord(); // ✅ open chat
          return; // ✅ keep listening
        }

        if (closeWords.some((word) => transcript.includes(word))) {
          console.log(`❎ Close word detected`);
          clearTimeout(silenceTimerRef.current);
          shouldRestart.current = false; // ✅ stop after close
          recognition.stop();
          if (typeof onCloseChat === "function") onCloseChat();
          return;
        }

        if (isChatOpen) {
          console.log("💬 Voice input detected during chat");
          clearTimeout(silenceTimerRef.current);
          shouldRestart.current = false; // ✅ stop after input
          recognition.stop();
          onVoiceInput(transcript);
          return;
        }
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      recognitionRef.current = null;
      console.log("🛑 Recognition ended");

      if (shouldRestart.current && restartAttempts.current < maxRestarts) {
        restartAttempts.current += 1;
        isRetrying.current = true;
        console.log(`🔁 Restarting recognition (attempt ${restartAttempts.current})`);
        setTimeout(() => startListening(), 500);
      } else {
        isRetrying.current = false;
        console.log("❌ Max restart attempts reached or restart disabled");
      }
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error === "no-speech") recognition.stop();
    };

    try {
      recognition.start();
      console.log("🚀 recognition.start() called");
    } catch (err) {
      console.warn("Start error:", err.message);
    }
  };

  return { startListening };
}
