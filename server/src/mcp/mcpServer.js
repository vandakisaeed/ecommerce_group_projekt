import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Get Pokémon info endpoint
app.post("/tools/get_pokemon_info", async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'name' parameter" });
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!response.ok) return res.status(404).json({ error: "Pokémon not found" });

    const data = await response.json();

    res.json({
      name: data.name,
      id: data.id,
      height: data.height,
      weight: data.weight,
      sprite: data.sprites.front_default,
      types: data.types.map((t) => t.type.name),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("✅ MCP Server running on port 5000"));
//setInterval(()=>{},1000)