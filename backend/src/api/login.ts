import express from "express";
import passport from "passport";
import { basicStrategy } from "../common/auth";
import jwt from "jsonwebtoken";

passport.use(basicStrategy);

const loginRoute = express.Router();
loginRoute.post(
  "/",
   passport.authenticate(
    "basic",
    { session: false, }
  ),
  (req, res) => {
      if(!req.user) return res.sendStatus(500)
      if(!process.env.JWT_KEY) throw new Error("env: JWT_KEY missing.")
      res.send(jwt.sign(req.user, process.env.JWT_KEY , {expiresIn: "15m"}))
  }
);

export default loginRoute;
