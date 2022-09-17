import mongoose from "mongoose";
import { IPost } from "../config/interface";
const postSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   video: {
      type: String,
      required: true,
   },
   cover_img: {
      type: String,
   },
   note: { 
      type: String,
      trim: true,
      maxLength: [150, 'Your note is up to 150 chars long'],
   },
   isComment: {
      type: Boolean,
      default: true,
   },
   roleWatcher: {
      type: String,
      default: 'public', // admin
      trim: true,
   },
}, { timestamps: true });


export default mongoose.model<IPost>('Post', postSchema);
