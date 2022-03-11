import { BasicStrategy } from "passport-http";
import User from "../models/User";

export const basicStrategy = new BasicStrategy(async (email, password, done) => {
  try {
    const user = await User.verifyPassword(email, password);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    done(error);
  }
});