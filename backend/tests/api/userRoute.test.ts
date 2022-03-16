import express, { Express } from "express";
import userRoute from "../../src/api/userRoute";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "http";
import axios from "axios";
import { AddressInfo } from "net";
import User from "../../src/models/User";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Role, User as IUser } from "../../../types";

let mongo: MongoMemoryServer;
let app: Express;
let server: Server;
let address: AddressInfo;
const jwt_key = "jwt_key";

const createToken = (
  valid = true,
  user: { email: string; role: Role } = {
    email: "kevin@example.com",
    role: "root",
  }
) => jwt.sign(user, valid ? jwt_key : "wrong_key", { expiresIn: "15m" });
const validToken = createToken();

beforeAll(async () => {
  process.env.JWT_KEY = "jwt_key";
  mongo = await MongoMemoryServer.create();
  const url = mongo.getUri();
  await mongoose.connect(url);
  app = express();
  app.use(passport.initialize());
  app.use("/user", userRoute);
  server = app.listen();
  address = server.address() as AddressInfo;
});

beforeEach(async () => {
  if (mongo) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongoose.disconnect();
    await mongo.stop();
  }
  server.close();
});

describe("User Route should", () => {
  test("create a new user in the database upon post request and return the created user.", async () => {
    const user = (
      await axios.post(
        "http://localhost:" + address.port + "/user",
        { email: "kevin@example.com", password: "123456", role: "root" },
        { headers: { Authorization: `Bearer ${validToken}` } }
      )
    ).data;

    expect(user._id).toBeDefined();
    expect(user).toMatchObject({ email: "kevin@example.com", role: "root" });
    expect(user.password).not.toBeDefined();


    const dbUser = await User.findById(user._id);
    expect(dbUser).toMatchObject({ email: "kevin@example.com", role: "root" });
    
  });

  test("send back all users upon get request.", async () => {
    //Create some Users
    const emails: string[] = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({ email: `kevin${i}@example.com`, role: "root",password: "123456" });
      await user.save();
      emails.push(user.email)
    }

    const users = (
      await axios.get("http://localhost:" + address.port + "/user", {
        headers: { Authorization: `Bearer ${validToken}` },
      })
    ).data;

    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBe(emails.length);

    emails.forEach((email) => {
      const user = users.find((user: IUser) => user.email === email);
      expect(user).toMatchObject({ email, role: "root" });
      expect(user.password).not.toBeDefined();
    });
  });

  test("send back a single user if id was provided in request.", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root",password: "123456" });
    await dbUser.save();

    const user = (
      await axios.get(
        "http://localhost:" + address.port + "/user/" + dbUser._id,
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      )
    ).data;

    expect(user).toMatchObject({
      email: `kevin@example.com`,
      role: "root",
      _id: dbUser._id,
    });
    expect(user.password).not.toBeDefined();
  });

  test("delete the user upon delete request.", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root",password: "123456" });
    await dbUser.save();

    const user = await axios.delete(
      "http://localhost:" + address.port + "/user/" + dbUser._id,
      {
        headers: { Authorization: `Bearer ${validToken}` },
      }
    );

    expect(user.status).toBe(200);
    const deletedUser = await User.findById(dbUser._id).exec();
    expect(deletedUser).toBe(null);
  });
});

describe("User Route should change the User information upon patch request.", () => {
  test("change only email.", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root",password: "123456" });
    await dbUser.save();

    const user = (
      await axios.patch(
        "http://localhost:" + address.port + "/user/" + dbUser._id,
        { email: "karsten@example.com" },
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      )
    ).data;

    expect(user).toMatchObject({ email: "karsten@example.com", role: "root" });
    expect(await User.verifyPassword(user.email, "123456")).toMatchObject({
      email: "karsten@example.com",
      role: "root",
    });
  });

  test("change only password.", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root",password: "123456" });
    await dbUser.save();

    const user = (
      await axios.patch(
        "http://localhost:" + address.port + "/user/" + dbUser._id,
        { password: "654321" },
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      )
    ).data;

    expect(user).toMatchObject({ email: "kevin@example.com", role: "root" });
    expect(await User.verifyPassword(user.email, "654321")).toMatchObject({
      email: "kevin@example.com",
      role: "root",
    });
  });

  test("change only role.", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root", password: "123456" });
    await dbUser.save();

    const user = (
      await axios.patch(
        "http://localhost:" + address.port + "/user/" + dbUser._id,
        { role: "admin" },
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      )
    ).data;

    expect(user).toMatchObject({ email: "kevin@example.com", role: "admin" });
    expect(await User.verifyPassword(user.email, "123456")).toMatchObject({
      email: "kevin@example.com",
      role: "admin",
    });
  });

  test("change everything at once", async () => {
    const dbUser = new User({ email: `kevin@example.com`, role: "root", password: "123456" });
    await dbUser.save();

    const user = (
      await axios.patch(
        "http://localhost:" + address.port + "/user/" + dbUser._id,
        { email: `karsten@example.com`, role: "admin", password: "654321" },
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      )
    ).data;

    expect(user).toMatchObject({ email: "karsten@example.com", role: "admin" });
    expect(await User.verifyPassword(user.email, "654321")).toMatchObject({
      email: "karsten@example.com",
      role: "admin",
    });
  });
});

describe("User Route should return Status 401 if", () => {
  test("no authentication token was sent.", async () => {
    const response = await axios.get(
      "http://localhost:" + address.port + "/user/",
      { validateStatus: () => true }
    );
    expect(response.status).toBe(401);
  });

  test("token is invalid.", async () => {
    const invalidToken = createToken(false);
    const response = await axios.get(
      "http://localhost:" + address.port + "/user/",
      {
        headers: { Authorization: `Bearer ${invalidToken}` },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(401);
  });

  test("token is expired.", async () => {
    const expiredToken = jwt.sign(
      {
        email: "kevin@example.com",
        role: "root",
        exp: Date.now() / 1000 - 500,
      },
      jwt_key
    );
    const response = await axios.get(
      "http://localhost:" + address.port + "/user/",
      {
        headers: { Authorization: `Bearer ${expiredToken}` },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(401);
  });

  test("role is not admin or root.", async () => {
    const wrongRoleToken = createToken(true, {
      email: "kevin@example.com",
      role: "customer",
    });
    const response = await axios.get(
      "http://localhost:" + address.port + "/user/",
      {
        headers: { Authorization: `Bearer ${wrongRoleToken}` },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(401);
  });
});

describe("User Route should return Status 400 on post request if", () => {
  test("email is missing.", async () => {
    const response = await axios.post(
      "http://localhost:" + address.port + "/user",
      { password: "123456", role: "root" },
      {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      }
    );

    expect(response.status).toBe(400);
  });

  test("password is missing.", async () => {
    const response = await axios.post(
      "http://localhost:" + address.port + "/user",
      { email: "kevin@example.com", role: "root" },
      {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      }
    );

    expect(response.status).toBe(400);
  });

  test("role is missing.", async () => {
    const response = await axios.post(
      "http://localhost:" + address.port + "/user",
      { email: "kevin@example.com", password: "123456" },
      {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      }
    );

    expect(response.status).toBe(400);
  });
});
