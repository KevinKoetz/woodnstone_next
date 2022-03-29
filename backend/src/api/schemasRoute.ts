import express from "express";
import mongoose from "mongoose";
import { convertTypesToFunctionNames } from "../common/utils";
import { authenticateBearer, determineUserAbility } from "../middlewares/auth";


const models = mongoose.models;



const schemaRoute = express.Router();
schemaRoute.get("/", async (req, res) => {
  const schemas = convertTypesToFunctionNames(
    Object.values(models).reduce((schemas, model) => {
      schemas[model.modelName] = model.schema.obj;
      if(model.modelName === "Reference") console.log(model.schema.obj);
      
      return schemas;
    }, {} as {[key: string]: {
      [path: string]: mongoose.SchemaDefinitionProperty<undefined>;
  } | {
      [x: string]: mongoose.SchemaDefinitionProperty<any> | undefined;
  }})
  );
  console.log(models);
  
  res.json(schemas);
});



export default schemaRoute;
