import express from "express";
import passport from "passport";
import { basicStrategy } from "../common/auth";
import jwt from "jsonwebtoken";
import User from "../models/user";

passport.use(basicStrategy);

const loginRoute = express.Router();
loginRoute.post(
  "/",
  async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.sendStatus(400);

    const [scheme, credentials] = authorization.split(" ");
    if (!/Basic/i.test(scheme)) return res.sendStatus(400);

    const [email, password] = Buffer.from(credentials, "base64")
      .toString()
      .split(":");
    if (!email || !password) return res.sendStatus(400);
    try {
      const user = await User.verifyPassword(email, password);
      if (!user) return res.sendStatus(401);
      if (!process.env.JWT_KEY) throw new Error("env: JWT_KEY missing.");
      res.send(jwt.sign(user, process.env.JWT_KEY, { expiresIn: "15m" }));
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

export default loginRoute;
