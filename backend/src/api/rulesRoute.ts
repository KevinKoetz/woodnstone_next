import express from "express"
import { authenticateBearer, determineUserAbility } from "../middlewares/auth";


const rulesRouter = express.Router();

rulesRouter.use(authenticateBearer({allowGuestAccess: true}));
rulesRouter.use(determineUserAbility);

rulesRouter.get("/", (req, res) => {
    if(!req.user?.ability) throw new Error("req.user.ability is undefined.")
    res.json(req.user.ability.rules)
})

export default rulesRouter