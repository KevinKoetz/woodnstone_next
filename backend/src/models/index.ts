import { readdirSync } from "fs";
import path from "path";
import mongoose from "mongoose"
import { accessibleRecordsPlugin } from "@casl/mongoose";

mongoose.plugin(accessibleRecordsPlugin)

readdirSync(__dirname).forEach((filename) =>
  filename !== __filename && require(path.join(__dirname, filename))
);