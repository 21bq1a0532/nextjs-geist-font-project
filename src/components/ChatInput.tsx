"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const isSupported = 
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window;
    setVoiceSupported(isSupported);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const startVoiceInput = () => {
    if (!voiceSupported) {
      alert("Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      adjustTextareaHeight();
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
      
      let errorMessage = "Voice recognition failed. ";
      switch (event.error) {
        case 'no-speech':
          errorMessage += "No speech was detected.";
          break;
        case 'audio-capture':
          errorMessage += "No microphone was found.";
          break;
        case 'not-allowed':
          errorMessage += "Microphone permission was denied.";
          break;
        default:
          errorMessage += "Please try again.";
      }
      alert(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      setIsListening(false);
      alert("Failed to start voice recognition. Please try again.");
    }
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={disabled ? "JARVIS is processing..." : "Ask JARVIS anything..."}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          {voiceSupported && (
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={disabled || isListening}
              className={`px-4 py-3 rounded-lg border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isListening ? 'bg-red-500 text-white border-red-500' : ''
              }`}
            >
              {isListening ? 'Listening...' : 'Voice'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {voiceSupported && (
              <span>• Voice input available</span>
            )}
          </div>
          <span>{input.length}/1000</span>
        </div>
      </form>
    </div>
  );
}
