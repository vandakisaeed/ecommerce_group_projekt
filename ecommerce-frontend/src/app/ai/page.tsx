"use client";
import { useState } from "react";

type Message = { role: "user" | "ai"; text: string };

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini" | "ollama">("openai");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, provider: provider }),
      });
 
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log(data)
      // Accept several response shapes for compatibility with server handlers:
      // - { results: {...} }         (original pokemon example)
      // - { answer: "..." }        (older controllers)
      // - { ai: "..." }            (some handlers)
      // - { success: true, response: "..." } (agent/gemini fast-path)
      // - { success: false, error, reason }  (error envelope)

      if (!data) throw new Error("Empty response from AI server");

      if (data.success === false) {
        // Server returned a structured error
        const reason = data.reason || data.error || "Unknown server error";
        throw new Error(`AI server error: ${reason}`);
      }

      if (data.results && typeof data.results === "object") {
        for (const [label, value] of Object.entries(data.results)) {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: `${label}: ${JSON.stringify(value)}` },
          ]);
        }
      } else if (data.answer) {
        setMessages((prev) => [...prev, { role: "ai", text: String(data.answer) }]);
      } else if (data.ai) {
        setMessages((prev) => [...prev, { role: "ai", text: String(data.ai) }]);
      } else if (data.response) {
        setMessages((prev) => [...prev, { role: "ai", text: String(data.response) }]);
      } else {
        // Fallback: stringify whatever we received so the user sees something
        setMessages((prev) => [...prev, { role: "ai", text: JSON.stringify(data) }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error reaching AI server" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-base-200 py-10 px-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
        <h2 className="text-3xl font-bold text-center mb-6">AI Interaction 🤖</h2>

        <div className="h-96 overflow-y-auto mb-4 p-4 border border-base-300 rounded-lg bg-base-200">
          {messages.length === 0 && (
            <p className="text-center text-gray-500">
              Start chatting with the AI!
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
            >
              <div
                className={`chat-bubble ${
                  msg.role === "user"
                    ? "chat-bubble-primary"
                    : "chat-bubble-secondary"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-secondary animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row items-center">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="select select-bordered w-full max-w-xs"
            aria-label="Choose AI provider"
          >
            <option value="openai">OpenAI (agents)</option>
            <option value="gemini">Google Gemini</option>
            <option value="ollama">Ollama (local)</option>
          </select>

          <input
            type="text"
            placeholder="Type your message..."
            className="input input-bordered flex-grow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
