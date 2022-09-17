import { IReqAuth, IComment } from './../config/interface';
import { Request, Response } from 'express';
import Comment from '../models/commentModel';
import Post from '../models/postModel';

const commentCtrl = {
   createComment: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { postId, content, tag, reply } = req.body;
         const newComment = new Comment({
            user: req.user._id,
            postId: postId._id,
            content,
            tag: tag,
         })
         const post = await Post.findByIdAndUpdate({ _id: postId._id }, { $push: { comments: newComment._id } }, { new: true })
         if (!post) return
         await newComment.save();
         res.json({ newComment: {...newComment._doc, user: req.user} })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   createAnswerComment: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { postId, content, tag, comment_root } = req.body;
         const newComment = new Comment({
            user: req.user._id, 
            postId: postId._id,
            content,
            tag: tag,
            comment_root: req.params.id,
         })
         const commentRoot = await Comment.findByIdAndUpdate({ _id: req.params.id }, { $push: { reply: newComment._id } }, { new: true })
         if (!commentRoot) return
         await newComment.save();
         res.json({ newComment: {...newComment._doc, user: req.user} })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   likeComment: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const comment = await Comment.findById(req.params.id)
         if (!comment) return res.status(400).json({ msg: 'Comment not found!' })
         if(comment.likes.includes(req.user._id)) return res.status(400).json({ msg: 'You already liked this comment!' })
         await Comment.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } }, { new: true })
         res.json({ msg: 'Like Comment Success!'})
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }, 
   unLikeComment: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const comment = await Comment.findById(req.params.id)
         if (!comment) return res.status(400).json({ msg: 'Comment not found!' })
         if(!comment.likes.includes(req.user._id)) return res.status(400).json({ msg: 'You do not like this comment!' })
         await Comment.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true })
         res.json({ msg: 'UnLike Comment Success!'})
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }, 
   deleteComment: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const comment = await Comment.findByIdAndDelete(req.params.id);
         if(!comment) return res.status(400).json({ msg: 'Comment not found!' })
         if(comment.comment_root) {
            await Comment.deleteMany({ comment_root: req.params.id })
         }
         res.json({ msg: 'Delete Comment Success!'})
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
}

export default commentCtrl;