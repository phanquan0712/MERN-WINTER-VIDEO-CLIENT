import mongoose from "mongoose";
import { IMessage } from "../config/interface";

const messageSchema = new mongoose.Schema({
   sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
   },
   text: String,
   media: Array,
   call: Object,
}, { timestamps: true})

export default mongoose.model<IMessage>("Message", messageSchema);