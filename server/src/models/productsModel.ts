// models/Product.ts
import mongoose, { Schema, model } from "mongoose";

// define Schema for Mongo
const productSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
		},
		description: {
			type: String,
			default: "",
			trim: true,
		},
		price: {
			type: Number,
			required: [true, "Product price is required"],
			min: 0,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Category",
		},
	},
	{
		timestamps: true,
	}
);

// Response shaping: map _id -> id, drop __v
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
	transform: (_doc, ret: any) => {
		ret.id = ret._id;
		delete ret._id;
		return ret;
	},
});

export default model("Product", productSchema);
