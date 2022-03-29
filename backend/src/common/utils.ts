
import { Schema } from "mongoose";

export function convertTypesToFunctionNames(obj: { [key: string]: unknown }) {
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
              .map((value) => value instanceof Schema ? convertTypesToFunctionNames(value.obj) : (value as Function).name);
    if(key === "type" && obj[key] instanceof Schema) result[key] = convertTypesToFunctionNames((obj[key] as Schema).obj)
  }

  return result;
}

export function isPlainObject(
  unknown: unknown
): unknown is { [key: string]: unknown } {
  if (typeof unknown !== "object") return false;
  if (unknown instanceof Function) return false;
  if (unknown === null) return false;
  if (Array.isArray(unknown)) return false;
  return true;
}
