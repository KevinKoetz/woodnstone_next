import { Schema, model, Types } from "mongoose";
import { Product } from "../../../types";

const isInteger = (number: number) => {
  return number === Math.floor(number);
};

const schema = new Schema<Product>({
  name: {
    type: String,
    required: true,
    unique: true,
    important: true,
    inputType: "text",
  },
  description: { type: String, required: true, inputType: "textarea" },
  startingPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: isInteger,
    important: true,
    inputType: "number",
  }, //Prices to be stored in euro-cents (no comma values)
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: isInteger,
    important: true,
    inputType: "number",
  },
  maxOrderAmount: {
    type: Number,
    required: true,
    min: 1,
    validate: isInteger,
    inputType: "number",
  },
  images: { type: [String], required: true, minlength: 1, inputType: "file" },
});

export default model("Product", schema);
