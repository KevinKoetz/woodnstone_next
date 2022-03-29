import {
  Schema,
  model,
  Model,
  Document,
  Query,
  Types,
  LeanDocument,
  models
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
const fakePassword = [fakeSalt.toString("base64"), crypto.scryptSync(
  fakeSalt.toString("base64"),
  fakeSalt,
  hashLength,
  scryptOptions
).toString("base64")]

interface InstanceMethods {
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
    important: true,
    inputType: "email"
  },
  password: {
    type: String,
    required: true,
    select: false,
    inputType: "password"
  },
  role: {
    type: String,
    required: true,
    enum: ["root", "admin", "customer"],
    important: true,
    inputType: "select"
  },
});

userSchema.pre("save", function (next) {
  if(this.password){
    const salt = crypto.randomBytes(keyLength);
    crypto.scrypt(
      this.password,
      salt,
      hashLength,
      scryptOptions,
      (err, derivedKey) => {
        if (err) throw err;
        this.password = salt.toString("base64") + ":" + derivedKey.toString("base64");
        next()
      }
    );
  }else {next()}
  
});

userSchema.pre(/update/i, function (next) {
  const update = this.getUpdate()
  if(update.password){
    const salt = crypto.randomBytes(keyLength);
    crypto.scrypt(
      update.password,
      salt,
      hashLength,
      scryptOptions,
      (err, derivedKey) => {
        if (err) throw err;
        update.password = salt.toString("base64") + ":" + derivedKey.toString("base64");
        this.setUpdate(update)
        next()
      }
    );
  }else {next()}
  
})


userSchema.query.byEmail = function (email: string): QueryHelpers {
  return this.findOne({ email: toLowerCase(email) });
};

userSchema.static(
  "verifyPassword",
  async function verifyPassword(email: string, password: string) {
    const user = await this
      .findOne({email})
      .select("+password").exec();
    const [ b64salt, b64hash ] = user ? (user as any).password.split(":") : fakePassword;
    const salt = Buffer.from(b64salt, "base64")
    const hash = Buffer.from(b64hash, "base64")
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
          if (err) return rej(err);
          if (!user || !check) return res(null);
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

export default model<User, UserModel>("User", userSchema);
