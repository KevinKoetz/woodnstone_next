import express from "express";
import Product from "../models/Product";
import multer from 'multer'

const upload = multer({ dest: "upload/" })

const productRoute = express.Router();
productRoute.post("/", upload.array("images"), async (req, res) => {


    try {
        const product = new Product({ ...req.body, images: (req.files as any)?.map((file: any) => file.filename) })  // creating new instance of class Product 
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

