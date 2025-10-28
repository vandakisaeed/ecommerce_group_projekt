import mongoose, { Document, Schema } from "mongoose";
interface ICategories extends Document {
	name: string;
}
const CategoriesSchema: Schema = new Schema({
	name: {
		type: String,
		required: [true, "Categoriename is required"],
		trim: true,
		minlength: [2, "Categoriename must be at least 2 characters"],
		maxlength: [50, "Categoriename cannot exceed 50 characters"],
	},
});
const Categories = mongoose.model<ICategories>("Categories", CategoriesSchema);
export default Categories;
