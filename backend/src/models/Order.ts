import { Schema, model, Types } from "mongoose";
import { Order, Address } from "../../../types";
import Product from "./Product";

const addressSchema = new Schema<Address>({
  country: { type: String, required: true, inputType: "text" },
  firstName: { type: String, required: true, inputType: "text" },
  houseNumber: { type: String, required: true, inputType: "text" },
  lastName: { type: String, required: true, inputType: "text" },
  postalCode: { type: String, required: true, inputType: "text" },
  street: { type: String, required: true, inputType: "text" },
});

const orderSchema = new Schema<Order>({
  dueDate: { type: Date, inputType: "date", important: true },
  email: { type: String, inputType: "email", important: true },
  invoiceAddress: { type: addressSchema, inputType: "subdocument" },
  shippingAddress: { type: addressSchema, inputType: "subdocument" },
  products: { type: [Types.ObjectId], ref: Product },
  status: {
    type: String,
    enum: [
      "new",
      "in Progress",
      "waiting for payment",
      "canceled",
      "shipped",
      "done",
    ],
    default: "new",
    inputType: "select",
    important: true,
  },
});

export default model("Order", orderSchema);
