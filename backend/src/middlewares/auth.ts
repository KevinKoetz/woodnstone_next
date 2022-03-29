import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AbilityBuilder, Ability } from "@casl/ability";

/* export const basicStrategy = new BasicStrategy(async (email, password, done) => {
  try {
    const user = await User.verifyPassword(email, password);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    done(error);
  }
}); */

interface AuthenticationStrategyOptions {
  allowGuestAccess?: boolean;
}

export const authenticateBearer =
  (
    { allowGuestAccess }: AuthenticationStrategyOptions = {
      allowGuestAccess: false,
    }
  ): RequestHandler =>
  (req, res, next) => {
    if (!req.headers.authorization) {
      if (allowGuestAccess) {
        req.user = { role: "guest" };
        return next();
      }
      return res.setHeader("WWW-Authenticate", "Bearer").sendStatus(401);
    }

    const [scheme, token] = req.headers.authorization.split(" ");
    if (!/Bearer/i.test(scheme)) {
      if (allowGuestAccess) {
        req.user = { role: "guest" };
        return next();
      }
      return res.setHeader("WWW-Authenticate", "Bearer").sendStatus(401);
    }
    if (!process.env.JWT_KEY || !process.env.JWT_EXPIRATION)
      throw new Error("env: JWT_KEY undefined.");

    jwt.verify(
      token,
      process.env.JWT_KEY,
      { maxAge: process.env.JWT_EXPIRATION },
      (err, payload) => {
        if (err) {
          if (allowGuestAccess) {
            req.user = { role: "guest" };
            return next();
          }
          return res.sendStatus(403);
        }

        if (typeof payload === "string") {
          if (allowGuestAccess) {
            req.user = { role: "guest" };
            return next();
          }
          return res.sendStatus(403);
        }

        if (!payload) {
          if (allowGuestAccess) {
            req.user = { role: "guest" };
            return next();
          }
          return res.sendStatus(403);
        }

        req.user = payload as Express.User;
        next();
      }
    );
  };

export const authenticateBasic =
  (
    { allowGuestAccess }: AuthenticationStrategyOptions = {
      allowGuestAccess: false,
    }
  ): RequestHandler =>
  async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      if (allowGuestAccess) {
        req.user = { role: "guest" };
        return next();
      }
      return res.setHeader("WWW-Authenticate", "Basic").sendStatus(401);
    }

    const [scheme, credentials] = authorization.split(" ");
    if (!/Basic/i.test(scheme)) {
      if (allowGuestAccess) {
        req.user = { role: "guest" };
        return next();
      }
      return res.setHeader("WWW-Authenticate", "Basic").sendStatus(401);
    }

    const [email, password] = Buffer.from(credentials, "base64")
      .toString()
      .split(":");
    if (!email || !password) {
      if (allowGuestAccess) {
        req.user = { role: "guest" };
        return next();
      }
      return res.status(400).send("Invalid Credentials format");
    }
    try {
      const user = await User.verifyPassword(email, password);
      if (!user) {
        if (allowGuestAccess) {
          req.user = { role: "guest" };
          return next();
        }
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    } catch (error) {
      res.send(error);
    }
  };

export const createRules = (user: Express.User | undefined) => {
  const { can, cannot, rules } = new AbilityBuilder(Ability);
  if (!user) return rules;

  switch (user.role) {
    case "root":
      can("manage", "all");
      break;
    case "admin":
      can("login", "Adminpage");
      can("manage", "Product");
      can("read", "User");
      can("create", "User");
      cannot("create", "User", { role: "root" });
      can("update", "User", { _id: user._id });
      break;
    case "customer":
      can("read", "Product");
      break;
    case "guest":
      can("read", "Product");
      break;
    default:
      const _never: never = user.role;
  }

  return rules;
};

export const determineUserAbility: RequestHandler = (req, res, next) => {
  if (!req.user)
    throw new Error(
      "req.user is undefined. Authentication layer should at least provide a guest user."
    );
  const rules = createRules(req.user);
  const ability = new Ability(rules);
  req.user = { ...req.user, ability };
  next();
};
