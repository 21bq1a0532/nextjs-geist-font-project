import { useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface JarvisChatProps {
  messages: Message[];
  isLoading?: boolean;
}

export function JarvisChat({ messages, isLoading = false }: JarvisChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-center">
          <div className="space-y-4 max-w-md">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">JARVIS is ready</h3>
              <p className="text-muted-foreground text-sm">
                Hello! I'm JARVIS, your AI assistant. How may I assist you today?
              </p>
            </div>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground border border-border"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            {message.timestamp && (
              <div
                className={`text-xs mt-2 opacity-70 ${
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-secondary text-secondary-foreground border border-border rounded-lg px-4 py-3 max-w-[80%]">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">JARVIS is thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
