
import express from "express";
import Product from "../models/Product";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, Options } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


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
      console.log("extension:", extension)
      return extension;
    },
    public_id: (req, file) =>
      `${req.body._id}-${Date.now()}-${file.originalname}`,
  },
} as Options);


const upload = multer({
  storage: storageCloudinary,
});

const productRoute = express.Router();
productRoute.post(
  "/",
  (req, res, next) => {
    
    try {
        upload.array("images")(req,res,next);
        console.log("Here!!!!");
        
      } catch (error) {
        
      } 
  },
  async (req, res) => {
    try {
      const product = new Product({
        ...req.body,
        images: (req.files as any)?.map((file: any) => file.filename),
      }); // creating new instance of class Product
      await product.save(); // has been created and saved after calling save()
      /* res.setHeader('Content-Type', 'application/json') */
      /* res.send(JSON.stringify(product)) */
      res.json(product);
    } catch (error: any) {
      res.status(400);
      res.send(error.message);
    }
  }
);

productRoute.get("/", async (req, res) => {
  const products = await Product.find().exec();
  res.json(products);
});

productRoute.get("/:id", (req, res) => {});
productRoute.patch("/:id", (req, res) => {});
productRoute.delete("/:id", (req, res) => {});
export default productRoute;
