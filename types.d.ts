import type { Types} from "mongoose";

//All keys are required except there is a ? after the key.

interface User {
  email: string; //unique
  password: Buffer; //Buffer because: https://nodejs.org/dist/latest-v16.x/docs/api/crypto.html#using-strings-as-inputs-to-cryptographic-apis
  role: Role;
}

interface Product {
  _id: Types.ObjectId;
  name: string; //unique
  description: string;
  startingPrice: number; //Prices to be stored in euro-cents (no comma values)
  stock: number;
  maxOrderAmount: number;
}

interface Reference {
  _id: Types.ObjectId;
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
  _id: Types.ObjectId;
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
  _id: Types.ObjectId;
  email: string;
  status: OrderStatus;
  dueDate: Date;
  shippingAddress: Address;
  invoiceAddress?: Address;
  products: Types.ObjectId[];
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
