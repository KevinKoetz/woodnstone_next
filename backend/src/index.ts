import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import "./models";
import loginRoute from "./api/loginRoute";
import schemasRoute from "./api/schemasRoute";
import crudRoutes from "./api/crudRoutes";
import { Role } from "../../types";
import { Ability } from "@casl/ability";
import rulesRouter from "./api/rulesRoute";

declare global {
  namespace Express {
    interface User {
      _id?: mongoose.Types.ObjectId;
      email?: string;
      role: Role;
      ability?: Ability;
    }
  }
}

if (!process.env.MONGO_DB) throw new Error("env: MONGO_DB not defined.");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((err) => {
    console.log("DB connection Error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(passport.initialize());

app.use(crudRoutes);
app.use("/login", loginRoute);
app.use("/schemas", schemasRoute);
app.use("/rules", rulesRouter);

app.listen(PORT, () => {
  console.log("App listening on Port:", PORT);
});
