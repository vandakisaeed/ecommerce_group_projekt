import express from "express";
import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const ai = async (req: any, res: any) => {
  const { prompt } = req.body;
  if (!prompt) return res.json({ answer: "No prompt provided!" });

  // Extract Pokémon name
  let pokemonName = prompt.match(/pok[eé]mon (\w+)/i)?.[1];
  if (!pokemonName) {
    const fallback = prompt.match(/\b([A-Z][a-z]+)\b/);
    if (fallback) pokemonName = fallback[1];
  }

  if (!pokemonName)
    return res.json({ answer: "I can only answer Pokémon questions!" });

  try {
    // --- Fetch data from MCP server ---
    const mcpResponse = await fetch("http://localhost:5000/tools/get_pokemon_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pokemonName }),
    });

    if (!mcpResponse.ok) throw new Error("Pokémon not found on MCP server");

    const mcpData = await mcpResponse.json();

    // --- Build AI prompt ---
    const aiPrompt = `Provide a friendly and fun description of this Pokémon and mention some interesting facts:\n${JSON.stringify(
      mcpData,
      null,
      2
    )}`;

    // --- Query OpenAI ---
    const aiCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // faster/cheaper than full gpt-4
      messages: [{ role: "user", content: aiPrompt }],
    });

    const aiText =
      aiCompletion.choices?.[0]?.message?.content ??
      "🤖 AI did not return a response.";

    // --- Respond to frontend ---
    res.json({ results: mcpData, ai: aiText });
  } catch (err: any) {
    console.error("❌ AI route error:", err);
    res.json({ answer: `Failed to reach MCP or AI server: ${err.message}` });
  }
};
