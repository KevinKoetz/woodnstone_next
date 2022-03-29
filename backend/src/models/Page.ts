import { Schema, model } from "mongoose";
import { Page, Prop } from "../../../types";

const propsSchema = new Schema<Prop>({
  inputType: { type: String, inputType: "text", required: true },
  name: { type: String, inputType: "text", required: true, unique: true },
  value: String,
});

const pageSchema = new Schema<Page>({
  name: {
    type: String,
    required: true,
    unique: true,
    important: true,
    inputType: "text",
  },
  props: {
    type: [propsSchema],
    required: true,
    inputType: "subdocument",
  },
});

export default model("Page", pageSchema);
