import { Schema, model, Model, Document, Query } from "mongoose";
import crypto from "crypto";
import { User } from "../../../types";

const keyLength = 16;
const hashLength = 64;

interface InstanceMethods {
  setPassword: (password: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
}

interface QueryHelpers {
  byEmail(name: string): Query<Omit<User, "password"> | null, Document<User>> & QueryHelpers;
}

const userSchema = new Schema<User, Model<Omit<User, "password">, QueryHelpers, InstanceMethods>>({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match:
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    set: toLowerCase,
  },
  password: {
    type: Buffer,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["root", "admin", "customer"],
  },
});

userSchema.methods.setPassword = async function (password: string) {
  return new Promise<void>((res, rej) => {
    // generate random 16 bytes long salt
    const salt = crypto.randomBytes(keyLength);

    crypto.scrypt(password, salt, hashLength, (err, derivedKey) => {
      if (err) rej(err);
      const password = Buffer.concat([salt, derivedKey]);
      this.password = password;
      res();
    });
  });
};

userSchema.methods.verifyPassword = async function (password: string) {
  return new Promise<boolean>((res, rej) => {
    const salt = this.password.slice(0, keyLength);
    const key = this.password.slice(keyLength, keyLength + hashLength);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) rej(err);
      res(derivedKey.equals(key));
    });
  });
};

userSchema.query.byEmail = function (email: string): QueryHelpers {
  return this.findOne({ email: toLowerCase(email) });
};

function toLowerCase(v: string) {
  return v.toLowerCase();
}

export default model<User, Model<Omit<User, "password">, QueryHelpers, InstanceMethods>>(
  "user",
  userSchema
);
