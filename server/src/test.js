const test_server = async () => {
  try {
    
    
    //const data = await fetch('https://pokeapi.co/api/v2/pokemon');
     const data = await fetch('http://localhost:5000/tools/get_pokemon_info', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 'name': 'kakuna' })
     }  )   


    const res = await data.json(); // ✅ await json()

    if (!res) {
      console.error('Something went wrong');
      return [];
    } else {
      console.log(res);
      // Example: return an array of Pokémon names
      return res.results?.map(pokemon  => pokemon.name) || [];
    }
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

// Usage
test_server().then((names) => console.log('Pokémon names:', names));
