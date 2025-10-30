"use client";
import { useState } from "react";

type Message = { role: "user" | "ai"; text: string };

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();

      if (!data || (!data.results && !data.answer)) {
        throw new Error("Invalid response from AI server");
      }

      if (data.results) {
        for (const [label, value] of Object.entries(data.results)) {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: `${label}: ${JSON.stringify(value)}` },
          ]);
        }
      } else if (data.answer) {
        setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
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

        <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
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
