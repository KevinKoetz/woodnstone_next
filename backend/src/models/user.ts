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
  byEmail(
    name: string
  ): Query<Omit<User, "password"> | null, Document<User>> & QueryHelpers;
}

const userSchema = new Schema<
  User,
  Model<Omit<User, "password">, QueryHelpers, InstanceMethods>
>({
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
    hash: { type: Buffer, required: true, select: false },
    salt: { type: Buffer, required: true, select: false },
    select: false
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
      this.password.salt = salt;
      this.password.hash = derivedKey;
      res();
    });
  });
};

userSchema.methods.verifyPassword = async function (password: string) {
  return new Promise<boolean>((res, rej) => {
    const {salt, hash} = this.password
    crypto.scrypt(password, salt, hashLength, (err, derivedKey) => {
      if (err) rej(err);
      res(derivedKey.equals(hash));
    });
  });
};

userSchema.query.byEmail = function (email: string): QueryHelpers {
  return this.findOne({ email: toLowerCase(email) });
};

function toLowerCase(v: string) {
  return v.toLowerCase();
}

export default model<
  User,
  Model<Omit<User, "password">, QueryHelpers, InstanceMethods>
>("user", userSchema);
