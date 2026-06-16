import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.route.js";
import db from "./config/db.js";
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(express.json());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({ message: "SafarLink Backend API is running successfully!" });
});

const PORT = process.env.PORT || 5000;

db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed", err);
});
