import express, { Request } from "express";
import { verifyAuthToken } from "../common/auth";
import User from "../models/User";
import { Error } from "mongoose";
import multer from "multer";

interface IUser {
  email: string;
  role: string;
  iat: number;
  exp: number;
}
interface RequestWithUser extends Request {
  user?: IUser;
}

const userRoute = express.Router();

userRoute.use(verifyAuthToken);

userRoute.use((req: any, res, next) => {
  if (!req.user) return res.sendStatus(401);
  if (req.user.role !== "root" && req.user.role !== "admin")
    return res.sendStatus(401);
  next();
});

userRoute.use(express.json());

userRoute.post("/", multer().none(), async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  try {
    const newUser = new User(req.body);
    await newUser.save();

    return res.json(
      Object.fromEntries(
        Object.entries(newUser.toObject()).filter(([key]) => key !== "password")
      )
    );
  } catch (error) {
    if (error instanceof Error.ValidationError)
      return res.status(400).send(error.message);
    return res.sendStatus(500);
  }
});

userRoute.get("/", async (req, res) => {
  const users = await User.find({}).exec();
  res.json(users);
});

userRoute.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).exec();
  if (!user) return res.sendStatus(404);
  res.send(user.toJSON());
});

userRoute.patch("/:id", multer().none(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) return res.sendStatus(404);
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.password) (user as any).password = req.body.password;
    await user.save();
    return res.send(user.toJSON());
  } catch (error) {
    if (error instanceof Error.ValidationError)
      return res.status(400).send(error.message);
    return res.sendStatus(500);
  }
});

userRoute.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id).exec();
  if (!user) return res.sendStatus(404);
  res.sendStatus(200);
});

export default userRoute;
