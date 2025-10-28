import mongoose, { Document, Schema } from "mongoose";

interface ICategory extends Document {
	name: string;
}

const CategorySchema: Schema<ICategory> = new Schema(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
			minlength: [2, "Category name must be at least 2 characters"],
			maxlength: [50, "Category name cannot exceed 50 characters"],
		},
	},
	{ timestamps: true }
);

// Response shaping: map _id -> id, drop __v
CategorySchema.set("toJSON", {
	virtuals: true,
	versionKey: false,
	transform: (_doc, ret: any) => {
		ret.id = ret._id;
		delete ret._id;
		return ret;
	},
});

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
