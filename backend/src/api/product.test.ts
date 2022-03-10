import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

import express, { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "http";
import axios from "axios";
import passport from "passport";
import productRoute from "./product";
import { AddressInfo } from "net";
import Product from "../models/Product";
import { FormData, File } from "formdata-node";
import { Buffer } from "buffer";
import { FormDataEncoder } from "form-data-encoder";
import { Readable } from "stream";

let mongo: MongoMemoryServer;
let app: Express;
let server: Server;
let address: AddressInfo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create(); // creating mongoDB in memory
  const url = mongo.getUri(); // getting URL of DB
  await mongoose.connect(url); // connecting mongoose with DB
  app = express(); // creating express app
  app.use(passport.initialize());
  app.use("/product", productRoute); // handle from productRoure middleware
  server = app.listen(); // start server
  address = server.address() as AddressInfo;
});

/* deletes everything in DB to have a clean starting point for each test  */
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

describe("the product route should", () => {
  test("return an array with product on the get request", async () => {
    const names: string[] = [];
    for (let i = 0; i < 10; i++) {
      const name = i.toString();
      names.push(name);
      await new Product({
        description: "Holz",
        name: name,
        startingPrice: 100,
        images: [""],
        stock: 10,
        maxOrderAmount: 50,
      }).save();
    }

    const response = await axios.get(
      "http://localhost:" + address.port + "/product"
    );
    expect(response.data).toBeInstanceOf(Array);

    names.forEach((name) => {
      expect(response.data.map((product: any) => product.name)).toContain(name);
    });
  });

  test("create a new product after post request ", async () => {
    const product = {
      description: "Holz",
      name: "test",
      startingPrice: 100,
      stock: 10,
      maxOrderAmount: 50,
    };

    //10x10px black png image
    const image1 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAOSURBVChTYxgFJAMGBgABNgABY8OiGAAAAABJRU5ErkJggg==",
      "base64"
    );

    //10x10px white png image
    const image2 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYSURBVChTY/z//z8DbsAEpXGAkSnNwAAApeMDEUEua14AAAAASUVORK5CYII=",
      "base64"
    );

    const form = new FormData();

    //Adding all the entries to the form Data
    Object.entries(product).forEach((entry) => form.set(entry[0], entry[1]));


    form.append("images", {
      type: "image/png",
      name: "image1.png",
      [Symbol.toStringTag]: "File",
      size: image1.length,
      stream() {
        return new Readable({
          read() {
            this.push(image1);
            this.push(null);
          },
        });
      },
    });

    form.append("images", {
      type: "image/png",
      name: "image2.png",
      [Symbol.toStringTag]: "File",
      size: image2.length,
      stream() {
        return new Readable({
          read() {
            this.push(image2);
            this.push(null);
          },
        });
      },
    });

    const encoder = new FormDataEncoder(form);

    const response = await axios.post(
      // sending via post req
      "http://localhost:" + address.port + "/product",
      Readable.from(encoder.encode()),
      { headers: encoder.headers }
    );

    expect(response.data).toMatchObject(product); //expecting the server to send product back
    expect(response.data._id).toBeDefined(); // expecting id inside of response data

    const dbProduct = await Product.findById(response.data._id);
    expect(dbProduct).toMatchObject(product); //expecting to find product in DB
    if (!dbProduct) throw new Error("Product not in DB.");
    expect(dbProduct.images).toHaveLength(2);

    //Get the image from the URL and expect it to be the same
    const downloadedImage1 = (
      await axios.get(dbProduct.images[0], { responseType: "arraybuffer" })
    ).data;
    expect(image1.equals(Buffer.from(downloadedImage1))).toBe(true);

    const downloadedImage2 = (
      await axios.get(dbProduct.images[1], { responseType: "arraybuffer" })
    ).data;
    expect(image2.equals(Buffer.from(downloadedImage2))).toBe(true);
  });
});
