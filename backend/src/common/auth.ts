import { BasicStrategy } from "passport-http";
import {RequestHandler} from "express"
import jwt from "jsonwebtoken"
import User from "../models/User";

/* export const basicStrategy = new BasicStrategy(async (email, password, done) => {
  try {
    const user = await User.verifyPassword(email, password);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    done(error);
  }
}); */

export const verifyAuthToken: RequestHandler = (req, res, next) => {
  if(!req.headers.authorization) return res.sendStatus(401);
    const [scheme, token] = req.headers.authorization.split(" ");
    if(!/Bearer/i.test(scheme)) return res. sendStatus(401);
    if(!process.env.JWT_KEY) throw new Error("env: JWT_KEY undefined.")

    jwt.verify(token, process.env.JWT_KEY, {maxAge: "15m"},(err, payload) => {
        if(err) return res.sendStatus(401);
        if(typeof payload === "string") return res.sendStatus(400)
        if(!payload) return res.sendStatus(400)
        req.user = payload as Express.User;
        next()
    })
}