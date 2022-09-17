import express from "express";
import auth from "../middleware/auth";
import notifyCtrl from "../controllers/notifyCtrl";
const router = express.Router();

router.route("/notify")
   .post(auth, notifyCtrl.createNotify)
   .get(auth, notifyCtrl.getNotifies)
export default router;