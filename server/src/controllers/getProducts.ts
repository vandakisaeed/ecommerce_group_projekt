export const getProducts = async(req:any, res:any) => {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
