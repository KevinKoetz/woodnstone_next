import type { ObjectId } from "mongoose";

//All keys are required except there is a ? after the key.

interface User {
  _id: ObjectId;
  email: string; //unique
  password: string;
  role: Role;
}

interface Product {
  _id: ObjectId;
  name: string; //unique
  description: string;
  startingPrice: number; //Prices to be stored in euro-cents (no comma values)
  stock: number;
  maxOrderAmount: number;
}

interface Reference {
  _id: ObjectId;
  name: string; //unique
  description?: string;
  sections?: Section[];
}

declare namespace Reference {
  //Sections are nested Objects on References, no seperate collection
  interface Section {
    heading: string;
    text: string;
    imgUrl?: string; //we will store the image in aws/azure
  }
}

interface Page {
  _id: ObjectId;
  name: string; //unique
  variables: { [key: string]: unknown };
}

namespace Page {
  interface About extends Page {
    name: "about";
    variables: {
      imageUrl: string;
      name: string;
      aboutMe: string;
      hobbies: string[];
    };
  }
}

interface Order {
  _id: ObjectId;
  email: string;
  status: OrderStatus;
  dueDate: Date;
  shippingAddress: Address;
  invoiceAddress?: Address;
  products: ObjectId[];
}

interface Address {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  country: string;
}

type Role = "root" | "admin" | "customer"

type OrderStatus =
  | "new"
  | "in Progress"
  | "waiting for payment"
  | "cancled"
  | "shipped"
  | "done";
