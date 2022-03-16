import express from "express";
import { readdirSync } from "fs";
import path from "path";
import Product from "../models/Product";

const models = readdirSync(path.join(__dirname, "../models")).map((filename) =>
  require(path.join(__dirname, "../models", filename))
);

const schemas = convertTypesToFunctionNames(
  models.reduce((schemas, model) => {  
    schemas[model.default.modelName] = model.default.schema.obj;
    return schemas;
  }, {})
);

const indexRoute = express.Router();
indexRoute.get("/", async (req, res) => {
  res.json(schemas);
});

function convertTypesToFunctionNames(obj: { [key: string]: unknown }) {
  const result: { [key: string]: unknown } = {};
  for (const key in obj) {
    result[key] = obj[key];
    if (isPlainObject(obj[key]))
      result[key] = convertTypesToFunctionNames(
        obj[key] as { [key: string]: unknown }
      );
    if (key === "type" && typeof obj[key] === "function")
      result[key] = (obj[key] as Function).name;
    if (key === "type" && Array.isArray(obj[key]))
      result[key] =
        (obj[key] as Array<unknown>).length === 0
          ? []
          : (obj[key] as Array<unknown>)
              .filter((item) => item instanceof Function)
              .map((fnc) => (fnc as Function).name);
  }

  return result;
}

function isPlainObject(
  unknown: unknown
): unknown is { [key: string]: unknown } {
  if (typeof unknown !== "object") return false;
  if (unknown instanceof Function) return false;
  if (unknown === null) return false;
  if (Array.isArray(unknown)) return false;
  return true;
}

export default indexRoute;
