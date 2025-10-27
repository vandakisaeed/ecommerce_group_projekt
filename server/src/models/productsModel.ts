// models/Product.ts
import mongoose, { Schema, model } from "mongoose";

// define Schema for Mongo
const productSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
		},
		price: {
			type: Number,
			required: [true, "Product price is required"],
			min: 0,
		},
		stock: {
			type: Number,
			required: [true, "Product stock is required"],
			min: 0,
		},
		tags: {
			type: [String],
			default: [],
		},
		categorieId: {
			type: mongoose.Schema.Types.ObjectId,
			require: true,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

export default model("Product", productSchema);
