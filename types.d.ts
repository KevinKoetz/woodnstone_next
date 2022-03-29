import type { Types} from "mongoose";

//All keys are required except there is a ? after the key.

interface User {
  email: string; //unique
  password: string;
  role: Role;
}

interface Token {
  _id: string,
  email: string,
  role: Role,
  iat: number,
  exp: number
}

interface Product {
  _id: string;
  name: string; //unique
  description: string;
  startingPrice: number; //Prices to be stored in euro-cents (no comma values)
  stock: number;
  maxOrderAmount: number;
  images: string[]
}

interface Reference {
  _id: Types.ObjectId;
  name: string; //unique
  description?: string;
  sections?: Reference.Section[];
}

interface Section {
  heading: string;
  text: string;
  imgUrl?: string; //we will store the image in aws/azure
}

interface Page {
  _id: Types.ObjectId;
  name: string; //unique
  props: Prop[]
}

interface Prop {
  name: string;
  value: string;
  inputType: "text" | "file" | "number"
}

/* namespace Page {
  interface About extends Page {
    name: "about";
    variables: {
      imageUrl: string;
      name: string;
      aboutMe: string;
      hobbies: string[];
    };
  }
} */

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

type Role = "root" | "admin" | "customer" | "guest"

type OrderStatus =
  | "new"
  | "in Progress"
  | "waiting for payment"
  | "cancled"
  | "shipped"
  | "done";
