import { IUser } from '../config/interface';
import { Request, Response } from 'express';
import Post from '../models/postModel';
import { IReqAuth } from '../config/interface';
import User from '../models/UserModel';
import Comment from '../models/commentModel';


class ApiFeatures {
   query: any;
   queryString: any;
   constructor(query: any, queryString: any) {
      this.query = query;
      this.queryString = queryString;
   }
   paginating() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 5;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this
   }
}


const postCtrl = {
   createPost: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { video, note, isComment, roleWatcher, cover_img } = req.body;
         console.log(req.body)
         const data = { video, cover_img, note, isComment, roleWatcher, user: req.user._id };
         const new_post = new Post({ ...data });
         await new_post.save();
         res.json({ msg: 'Post created successfully!', success: true })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getHomePost: async (req: Request, res: Response) => {
      try {
         const features = new ApiFeatures(Post.find({ roleWatcher: 'public'}), req.query).paginating()
         const posts = await features.query.sort({ createdAt: -1 })
         .populate('user', 'avatar name winterId following followers')
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'user',
               select: '-password',
            },
         })
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'reply',
               populate: {
                  path: 'user',
                  select: '-password',
               },
            },
         })
         res.json({
            posts,
            total: posts.length
         })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   likePost: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const post = await Post.findById(req.params.id)
         if (!post) return res.status(400).json({ msg: 'Post not found!' })
         if (post.likes.includes(req.user._id)) return res.status(400).json({ msg: 'You already liked this post!' })
         await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } })
         await User.findByIdAndUpdate(req.user._id, { $push: { liked: post._id } })
         res.json({ msg: 'Post liked successfully!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   unLikePost: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const post = await Post.findById(req.params.id)
         if (!post) return res.status(400).json({ msg: 'Post not found!' })
         if (!post.likes.includes(req.user._id)) return res.status(400).json({ msg: 'You do not like this post!' })
         await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } })
         await User.findByIdAndUpdate(req.user._id, { $pull: { liked: post._id } })
         res.json({ msg: 'Post unliked successfully!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getPostFollowing: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {

         const features = new ApiFeatures(Post.find({ user: { $in: req.user.following }, $or: [
            { roleWatcher: 'public' },
            { roleWatcher: 'follower' },
         ]}), req.query).paginating()
         const posts = await features.query.sort({ createdAt: -1 })
         .populate('user', 'avatar name winterId following followers')
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'user',
               select: '-password',
            },
         })
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'reply',
               populate: {
                  path: 'user',
                  select: '-password',
               },
            },
         })
         res.json({ posts, total: posts.length })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getDetailPost: async (req: Request, res: Response) => {
      try {
         const post = await Post.findById(req.params.id).populate('user', 'avatar name winterId following followers')
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'user',
               select: '-password',
            },
         })
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 }
            },
            populate: {
               path: 'reply',
               populate: {
                  path: 'user',
                  select: '-password',
               },
            },
         })
         if (!post) return res.status(400).json({ msg: 'Post not found!' })
         res.json({ post })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   deletePost: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const post = await Post.findByIdAndDelete(req.params.id);
         if (!post) return res.status(400).json({ msg: 'Post not found!' })
         await Comment.deleteMany({ postId: post._id })
         await User.findByIdAndUpdate(req.user._id, { $pull: { liked: post._id } })
         res.json({ msg: 'Post deleted successfully!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   updatePost: async (req:IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const { roleWatcher, isComment } = req.body;
         await Post.findByIdAndUpdate({ _id: req.params.id}, { roleWatcher, isComment })
         res.json({ msg: 'Post updated successfully!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })  
      }
   },
   searchPost: async (req: Request, res: Response) => {
      try {
         const posts = await Post.aggregate([
            {
               $search: {
                  index: 'searchitle',
                  autocomplete: {
                     "query": `${req.query.note}`,
                     "path": "note"
                  }
               }
            },
            { $limit: 5 },
            { $sort: { createdAt: -1 } },
            {
               $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user'
               }
            },
            {
               $project: {
                  video: 1,
                  cover_img: 1,
                  user: 1,
                  note: 1,
                  liked: 1,
               }
            }
         ])
         if(!posts.length) return res.status(400).json({ msg: 'No post!'})
         res.json({ posts })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }
}

export default postCtrl;