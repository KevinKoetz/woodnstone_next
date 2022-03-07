import {Request, Response, NextFunction} from "express"
import loginRoute from "./login"
import productRoute from "./product"

export default function routes(req: Request, res: Response, next: NextFunction) {
    req.app.use("/login", loginRoute)
    req.app.use("/product", productRoute)
    next()
}