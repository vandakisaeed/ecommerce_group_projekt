import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // important for reading cookies
import { Productrouter, authRouter ,orderRouter,aiRouter} from "#routes";
import { mongoDBConnect } from "./db/index";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
mongoDBConnect()
// ✅ CORS FIX:
app.use(cors({
  origin: "http://localhost:3000",  // your Next.js frontend URL
  credentials: true,                // allow cookies and authorization headers
}));

// ✅ Routes
app.use("/auth_server", authRouter);
app.use("/products", Productrouter);
app.use("/orders", orderRouter);

app.use("/ask", aiRouter);


// ✅ 404 fallback
app.use(/.*/, (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
  });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
