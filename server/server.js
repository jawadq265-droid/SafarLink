import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is Started on PORT:", 3000);
});