import type { Request, Response } from "express";
import { Product,Category } from "../models";
import mongoose from "mongoose";

// ✅ Fetch products from fakestoreapi & save to MongoDB
export const importProducts = async (req: Request, res: Response) => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    // 🧠 Transform data to match your schema
    const productsToInsert = data.map((item: any) => ({
      name: item.title,
      price: item.price,
      stock: Math.floor(Math.random() * 100), // random stock since API has none
      tags: [item.category],
      categorieId: new mongoose.Types.ObjectId(), // fake id for now (you can replace with real Category)
    }));

    // 🧹 Optional: clear old products before reimport
    await Product.deleteMany({});

    // 💾 Save all products
    const savedProducts = await Product.insertMany(productsToInsert);

    res.status(201).json({
      message: "Products imported successfully!",
      count: savedProducts.length,
      products: savedProducts,
    });
  } catch (error: any) {
    console.error("Error importing products:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all products from MongoDB
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /products/create
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, tags, categorieId } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = new Product({
      name,
      price,
      stock,
      tags,
      categorieId: categorieId || null,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err: any) {
    console.error("Error saving product:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /products/:id
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.findById(categorieId).populate("categorieId", "name"); 
    res.json(categories); // ✅ must be an array
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: error.message });
  }
};

// Optional: create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    const category = new Category({ name });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};