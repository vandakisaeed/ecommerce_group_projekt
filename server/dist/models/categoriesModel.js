import mongoose, { Document, Schema } from "mongoose";
const CategoriesSchema = new Schema({
    name: {
        type: String,
        required: [true, "Categoriename is required"],
        trim: true,
        minlength: [2, "Categoriename must be at least 2 characters"],
        maxlength: [50, "Categoriename cannot exceed 50 characters"],
    },
});
const Categories = mongoose.model("Categories", CategoriesSchema);
export default Categories;
