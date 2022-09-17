import mongoose from "mongoose";
import { IComment } from "../config/interface";


const commentSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
   postUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   content: { type: String, required: true, trim: true },
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   tag:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   reply: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
   comment_root: { type: mongoose.Types.ObjectId, ref: 'comment' },
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', commentSchema);