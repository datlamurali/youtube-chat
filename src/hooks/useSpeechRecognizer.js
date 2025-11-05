import { useRef } from "react";

export default function useSpeechRecognizer({
  onWakeWord,
  onVoiceInput,
  isChatOpen,
  setIsListening,
  wakeWords = ["wake up"],
  closeWords = ["close chat"],
  onCloseChat,
  timeoutMs = 600000000,
  maxRestarts = 3,
  micActive,
  onResumeListening // ✅ callback for toast
}) {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartAttempts = useRef(0);
  const isRetrying = useRef(false);
  const shouldRestart = useRef(true);

  const startListening = () => {
    if (micActive) {
      console.log("🎤 Mic is active — skipping wake word listener");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("🚫 SpeechRecognition not supported.");
      return;
    }

    // ✅ Reset restart logic BEFORE creating recognizer
    shouldRestart.current = true;
    restartAttempts.current = 0;
    isRetrying.current = false;

    if (recognitionRef.current) {
      console.log("🧹 Cleaning up stale recognition before restart");
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("⚠️ Error stopping stale recognition:", err.message);
      }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      console.log("🎙️ Recognition started — waiting for wake word or input");
      if (typeof onResumeListening === "function") onResumeListening();

      silenceTimerRef.current = setTimeout(() => {
        console.log(`⏱️ Timeout: No input detected in ${timeoutMs / 1000}s — stopping`);
        recognition.stop();
      }, timeoutMs);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        console.log("🗣️ Heard:", transcript);

        if (wakeWords.some((word) => transcript.includes(word))) {
          console.log("✅ Wake word detected");
          clearTimeout(silenceTimerRef.current);
          onWakeWord();
          return;
        }

        if (closeWords.some((word) => transcript.includes(word))) {
          console.log("❎ Close word detected");
          clearTimeout(silenceTimerRef.current);

          // ✅ Keep listening after closing chat
          shouldRestart.current = true;

          recognition.stop();
          if (typeof onCloseChat === "function") onCloseChat();
          return;
        }

        if (micActive) {
          console.log("🎤 Voice input triggered by mic");
          clearTimeout(silenceTimerRef.current);
          shouldRestart.current = false;
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
      console.warn("⚠️ Speech recognition error:", e.error);
      if (e.error === "no-speech") recognition.stop();
    };

    try {
      recognition.start();
      console.log("🚀 recognition.start() called");
    } catch (err) {
      console.warn("❌ Error starting recognition:", err.message);
    }
  };

  const stopListening = (disableRestart = false) => {
    if (recognitionRef.current) {
      console.log("🛑 Manually stopping recognition");

      if (disableRestart) {
        shouldRestart.current = false; // ✅ Prevent auto-restart
      }

      recognitionRef.current.stop();
      recognitionRef.current = null;
      clearTimeout(silenceTimerRef.current);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };



  return { startListening, stopListening };
}
