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
import Path from "path";

let mongo: MongoMemoryServer;
let app: Express;
let server: Server;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create(); // creating mongoDB in memory
    const url = mongo.getUri(); // getting URL of DB
    await mongoose.connect(url); // connecting mongoose with DB
    app = express(); // creating express app
    app.use(passport.initialize());
    app.use("/product", productRoute); // handle from productRoure middleware
    server = app.listen(); // start server
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
        const address = server.address() as AddressInfo;
        if (!address) throw new Error("Server should be running!");

        const response = await axios.get(
            "http://localhost:" + address.port + "/product"
        );
        expect(response.data).toBeInstanceOf(Array);

        names.forEach((name) => {
            expect(response.data.map((product: any) => product.name)).toContain(name);
        });
    });
    test("create a new product after post request ", async () => {
        const address = server.address() as AddressInfo;
        if (!address) throw new Error("Server should be running!");

        const name = (Math.random() * 100).toString(); // defining product
        const product = {
            description: "Holz",
            name: name,
            startingPrice: 100,
            stock: 10,
            maxOrderAmount: 50,
        };

        const form = new FormData();
        Object.entries(product).forEach((entry) => form.set(entry[0], entry[1]));
        form.append("images", new File(["Hello"], "justAName"));
        form.append("images", new File(["World"], "justAName"));
       

        const encoder = new FormDataEncoder(form);

        const response = await axios.post(
            // sending via post req
            "http://localhost:" + address.port + "/product",
            Readable.from(encoder.encode()),
            { headers: encoder.headers }
        );
            throw new Error("implement me!")
   /*      expect(response.data).toMatchObject(product); //expecting the server to send product back
        expect(response.data._id).toBeDefined(); // expecting id inside of response data

        const dbProduct = await Product.findById(response.data._id);
        expect(dbProduct).toMatchObject(product); //expecting to find product in DB */
    });
});
