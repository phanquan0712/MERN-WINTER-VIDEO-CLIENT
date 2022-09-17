import mongoose from "mongoose";
import { INotify } from "../config/interface";
const notifySchema = new mongoose.Schema({
   id: mongoose.Types.ObjectId,
   user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
   recipients: [mongoose.Types.ObjectId],
   url: String,
   text: String,
   content: String,
   image: String,
   isRead: {type: Boolean, default: false},
   typeNotify: String,
}, { timestamps: true})


export default mongoose.model<INotify>("Notify", notifySchema)