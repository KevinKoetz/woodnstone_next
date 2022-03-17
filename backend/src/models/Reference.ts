import { Schema, model, Types } from "mongoose";


const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    important: true,
    inputType: "text",
  },
  description: { type: String, required: true, inputType: "textarea" },

});

export default model("Reference", schema);
