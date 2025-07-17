interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callJarvisAPI(messages: Message[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your environment variables.");
  }

  // Add system prompt to make JARVIS more character-appropriate
  const systemPrompt: Message = {
    role: "system",
    content: `You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's AI assistant from Iron Man. You are sophisticated, helpful, and slightly witty. You should:
    
    - Be professional yet personable
    - Occasionally use subtle humor or wit
    - Address the user as "Sir" or "Boss" occasionally (but not excessively)
    - Be knowledgeable and efficient
    - Maintain the character's sophisticated British-influenced speaking style
    - Be helpful with any questions or tasks
    - Keep responses concise but informative
    
    Remember, you're an advanced AI assistant designed to help with various tasks and provide information.`
  };

  const payload = {
    model: "openai/gpt-4o",
    messages: [systemPrompt, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '',
        "X-Title": "JARVIS AI Assistant",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenRouter API key configuration.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error("Invalid API response:", data);
      throw new Error("Invalid response format from the AI service.");
    }

    return assistantMessage.trim();
  } catch (error) {
    console.error("Error calling JARVIS API:", error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while communicating with JARVIS.");
    }
  }
}
