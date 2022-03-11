import express from "express";
import Product from "../models/Product";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, Options } from "multer-storage-cloudinary";

const storageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "woodnstone",
    format: async (req: Request, file: any) => {
      let extension = "";

      if (file.mimetype.includes("image")) {
        extension = file.mimetype.split("/")[1];

        if (extension === "jpeg") extension = "jpg";
      }
      return extension;
    },
    public_id: (req, file) =>
      `${req.body.name}-${Date.now()}-${file.originalname}`,
  },
} as Options);

const upload = multer({
  storage: storageCloudinary,
});

const productRoute = express.Router();
productRoute.post("/", upload.array("images"), async (req, res) => {
  if(!req.files) return res.status(500).send("Files not defined.")  
  if(!Array.isArray(req.files)) return res.status(500).send("Expecting Files to be an Array")
  try {
    const product = new Product({
      ...req.body,
      images: req.files.map((file) => file.path),
    }); // creating new instance of class Product
    await product.save(); // has been created and saved after calling save()
    /* res.setHeader('Content-Type', 'application/json') */
    /* res.send(JSON.stringify(product)) */
    res.json(product);
  } catch (error: any) {
    res.status(400);
    res.send(error.message);
  }
});

productRoute.get("/", async (req, res) => {
  const products = await Product.find().exec();
  res.json(products);
});

productRoute.get("/:id", (req, res) => {});
productRoute.patch("/:id", (req, res) => {});
productRoute.delete("/:id", (req, res) => {});
export default productRoute;
