import { Schema, model } from "mongoose";
import { User} from "../../../types";

const userSchema = new Schema<User>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["root", "admin", "customer"]
    }
})

export default model<User>("user", userSchema)