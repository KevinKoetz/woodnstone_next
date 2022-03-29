import express, { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { authenticateBasic, determineUserAbility } from "../middlewares/auth";

const provideToken: RequestHandler = async (req, res) => {
  if (req.user?.ability?.can("login", "Adminpage")) {
    if (!process.env.JWT_KEY) throw new Error("env: JWT_KEY missing.");
    if (!req.user) throw new Error("Can not produce Token for undefined User.");
    return res.send(jwt.sign({_id: req.user._id, email: req.user.email, role: req.user.role}, process.env.JWT_KEY, { expiresIn: "15m" }));
  }
  res.sendStatus(403)
};

const loginRoute = express.Router();
loginRoute.post(
  "/",
  authenticateBasic({ allowGuestAccess: false }),
  determineUserAbility,
  provideToken
);

export default loginRoute;
