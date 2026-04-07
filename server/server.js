import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.route.js";
import db from "./config/db.js";
import dns from "dns";
// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

const PORT = process.env.PORT || 5000;

db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed", err);
});
