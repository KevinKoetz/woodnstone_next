import { Schema, model } from "mongoose";
import { Reference, Section } from "../../../types";

const sectionSchema = new Schema<Section>({
  heading: { type: String, required: true, inputType: "text" },
  imgUrl: { type: String, inputType: "file" },
  text: { type: String, required: true, inputType: "textarea" },
});
const referenceSchema = new Schema<Reference>({
  name: {
    type: String,
    required: true,
    unique: true,
    important: true,
    inputType: "text",
  },
  description: { type: String, required: true, inputType: "textarea" },
  sections: {
    type: [sectionSchema],
    required: true,
    validate: function (array: Section[]) {
      return array.length >= 1;
    },
    minlength: 1,
    inputType: "subdocument",
  },
});

export default model("Reference", referenceSchema);
