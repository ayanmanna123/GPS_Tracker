// components/MicInput.jsx
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const MicInput = ({ value, onChange, placeholder, ...props }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { value: transcript } });
    };

    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.onerror = () => setListening(false);

    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <Mic
        className={`absolute top-2.5 right-2 h-5 w-5 cursor-pointer ${
          listening ? "text-red-500 animate-pulse" : "text-gray-500"
        }`}
        onClick={startListening}
        title="Click to speak"
      />
    </div>
  );
};

export default MicInput;
