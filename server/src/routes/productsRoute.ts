import { Router } from 'express';
import { getProducts ,getAllProducts , importProducts,createProduct,getCategories,createCategory, deleteProduct} from "#controllers";

export const Productrouter = Router();

Productrouter
  .route('/')
  .get(getProducts)
  .post(getProducts)


Productrouter.get("/import", importProducts); // 👉 fetch + save to DB
Productrouter.get("/dbproduct", getAllProducts);       // 👉 get saved products.get("/import", importProducts); // 👉 fetch + save to DB
Productrouter.post("/create", createProduct);       // 👉 get saved products.get("/import", importProducts); // 👉 fetch + save to DB
Productrouter.get("/categories", getCategories);       // 👉 get saved products.get("/import", importProducts); // 👉 fetch + save to DB
Productrouter.post("/categories", createCategory);       // 👉 get saved products.get("/import", importProducts); // 👉 fetch + save to DB
Productrouter.delete("/delete/:id", deleteProduct);       // 👉 get saved products.get("/import", importProducts); // 👉 fetch + save to DB

