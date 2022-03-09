import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import express from "express";
import mongoose from "mongoose";
import api from "./api";
import passport from "passport";

if (!process.env.MONGO_DB) throw new Error("env: MONGO_DB not defined.");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connected to DB!"))
  .catch((err) => {
    console.log("DB connection Error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 4000;
const app = express();

app.use(passport.initialize());
app.use(api);

app.listen(PORT, () => {
  console.log("App listening on Port:", PORT);
});
