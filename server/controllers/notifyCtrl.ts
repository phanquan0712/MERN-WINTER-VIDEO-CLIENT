import Notify from "../models/notifyModel";
import { IReqAuth, IUser } from "../config/interface";
import { Request, Response } from "express";


const notifyCtrl = {
   createNotify: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: "Invalid Authentication." });
      try {
         const { id, recipients, url, text, content, image, typeNotify } = req.body
         console.log(recipients)
         const newRecipients = (recipients as IUser[]).filter(item => item._id !== req.user?._id)
         if(recipients.includes(req.user._id?.toString())) return;
         const notify = new Notify({
            id, recipients: newRecipients, url, text, content, image, user: req.user._id, typeNotify
         })
         console.log(notify);
         
         await notify.save()
         res.json({ notify })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   getNotifies: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: "Invalid Authentication." });
      try {
         const notifies = await Notify.find({ recipients: req.user._id }).sort("-createdAt").populate("user", "avatar name")
         res.json({ notifies })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      }
   }
}

export default notifyCtrl