import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import router from "./routes/index.route.js";
import db from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

db();

app.listen(5000, () => {
  console.log("Server is Started on PORT:", 5000);
});
