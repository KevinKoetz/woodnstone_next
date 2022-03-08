import express, { Express } from "express";
import loginRoute from "./login";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "http";
import axios from "axios";
import { AddressInfo } from "net";
import User from "../models/user";
import passport from "passport";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;
let app: Express;
let server: Server;
const jwt_key = "jwt_key"

beforeAll(async () => {
  process.env.JWT_KEY = "jwt_key";
  mongo = await MongoMemoryServer.create();
  const url = mongo.getUri();
  await mongoose.connect(url);
  app = express();
  app.use(passport.initialize());
  app.use("/login", loginRoute);
  server = app.listen();
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

describe("the login route should", () => {
  test("return status 401 if user is not present.", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "notthere@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(401);
  });

  test("return status 401 if user is present and password is invalid", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "456849" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(401);
  });

  test("return status 200 if user is present and password is valid", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(200);
  });

  test("return a jwt when email and password are valid.", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(200);
    expect(jwt.verify(response.data, "jwt_key")).toMatchObject({
      email: "kevin@example.com",
      _id: user._id,
      role: "root",
    });
  });

  
});

describe("The jwt should", () => {
  test("expire in 15 min.", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(200);
    const token = jwt.verify(response.data, "jwt_key")
    if(typeof token === "string") throw new Error("Shouldn't be a string")
    expect(token.exp).toBeDefined()
    expect(token.iat).toBeDefined()
    if(!token.exp || !token.iat) throw new Error("exp or iat not defined on token.")
    expect(token.exp - token.iat).toBe(900);
  });

  test("contain the user email and role.", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(200);
    const token = jwt.verify(response.data, "jwt_key")
    if(typeof token === "string") throw new Error("Shouldn't be a string")
    expect(token.email).toBeDefined()
    expect(token.role).toBeDefined()
  });

  test("not contain the password", async () => {
    const address = server.address() as AddressInfo;
    if (!address) throw new Error("Server should be running!");

    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const response = await axios.post(
      "http://localhost:" + address.port + "/login",
      null,
      {
        auth: { username: "kevin@example.com", password: "123456" },
        validateStatus: () => true,
      }
    );
    expect(response.status).toBe(200);
    const token = jwt.verify(response.data, "jwt_key")
    if(typeof token === "string") throw new Error("Shouldn't be a string")
    expect(token.password).not.toBeDefined()
  });
})