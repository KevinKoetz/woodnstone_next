import express from "express";
import Product from "../models/Product";

const productRoute = express.Router();
productRoute.post("/", async (req, res) => {
    console.log('body:', req.body)
    try {
        const product = new Product(req.body)  // creating new instance of class Product 
        await product.save()                    // has been created and saved after calling save()
        /* res.setHeader('Content-Type', 'application/json') */
        /* res.send(JSON.stringify(product)) */
        res.json(product)
    } catch (error: any) {
        res.status(400)
        res.send(error.message)
    }
});


productRoute.get("/", async (req, res) => {
    const products = await Product.find().exec()
    res.json(products)
});

productRoute.get("/:id", (req, res) => { });
productRoute.patch("/:id", (req, res) => { });
productRoute.delete("/:id", (req, res) => { });
export default productRoute;
