import {
  Schema,
  model,
  Model,
  Document,
  Query,
  Types,
  LeanDocument,
} from "mongoose";
import crypto from "crypto";
import { User } from "../../../types";

const keyLength = 16;
const hashLength = 64;
const scryptOptions = {
  N: 16384,
  r: 8,
  p: 4,
};

const fakeSalt = crypto.randomBytes(keyLength);
const fakePassword = {
  salt: fakeSalt,
  hash: crypto.scryptSync(
    "PjbEX,4v{jq<7J7V",
    fakeSalt,
    hashLength,
    scryptOptions
  ),
};

interface InstanceMethods {
  setPassword: (password: string) => Promise<void>;
}

interface QueryHelpers {
  byEmail(name: string): Query<
    | (Document<unknown, any, Omit<User, "password">> &
        Omit<User, "password"> & {
          _id: Types.ObjectId;
        } & InstanceMethods)
    | null,
    Document<User>
  > &
    QueryHelpers;
}

interface UserModel
  extends Model<Omit<User, "password">, QueryHelpers, InstanceMethods> {
  verifyPassword(
    email: string,
    password: string
  ): Promise<LeanDocument<
    Document<unknown, any, Omit<User, "password">> &
      Omit<User, "password"> & {
        _id: Types.ObjectId;
      } & InstanceMethods
  > | null>;
}

const userSchema = new Schema<User, UserModel>({
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

    crypto.scrypt(
      password,
      salt,
      hashLength,
      scryptOptions,
      (err, derivedKey) => {
        if (err) rej(err);
        this.password.salt = salt;
        this.password.hash = derivedKey;
        res();
      }
    );
  });
};

userSchema.query.byEmail = function (email: string): QueryHelpers {
  return this.findOne({ email: toLowerCase(email) });
};

userSchema.static(
  "verifyPassword",
  async function verifyPassword(email: string, password: string) {
    const user = await model<User, UserModel>("user", userSchema)
      .find()
      .byEmail(email)
      .select("+password.hash +password.salt");
    const { salt, hash } = user ? (user as any).password : fakePassword;
    return new Promise<LeanDocument<
      Document<unknown, any, Omit<User, "password">> &
        Omit<User, "password"> & {
          _id: Types.ObjectId;
        } & InstanceMethods
    > | null>((res, rej) => {
      crypto.scrypt(
        password,
        salt,
        hashLength,
        scryptOptions,
        (err, derivedKey) => {
          const check = derivedKey.equals(hash);
          if (err) return rej(err)
          if(!user || !check) return res(null);
          const result = user.toObject();
          (result as any).password = undefined;
          res(result);
        }
      );
    });
  }
);

function toLowerCase(v: string) {
  return v.toLowerCase();
}

export default model<User, UserModel>("user", userSchema);
