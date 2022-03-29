import mongoose from "mongoose";
import { Ability } from "@casl/ability";
import { Role } from "../../types";

declare global {
    namespace Express {
      interface User {
        _id?: mongoose.Types.ObjectId,
        email?: string,
        role: Role,
        ability?: Ability
      }
    }
  }