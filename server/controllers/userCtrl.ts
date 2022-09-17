import User from "../models/UserModel";
import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Post from "../models/postModel";


const userCtrl = {
   updateUser: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { winterId, avatar, name, story, roleChat } = req.body;
         console.log(roleChat)
         const data = { winterId, avatar, name, story, roleChat };
         const user = await User.findOneAndUpdate({ _id: req.user._id }, data, { new: true });
         if (!user) return res.status(400).json({ msg: 'This User does not exist!' })
         res.json({ msg: 'User updated successfully!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   getDiscoverUser : async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({msg: 'Invalid Authentication!'})
      try {
         const users = await User.find({ _id: { $nin: req.user._id } }).select('-password').sort('followers')
         res.json({ users, total: users.length});
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   getDiscoverUserNoLogin : async (req: IReqAuth, res: Response) => {
      try {
         const users = await User.find().select('-password').sort('followers')
         res.json({ users, total: users.length });
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   getSuggestionUser: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      const newArr = [...req.user.following, req.user?._id]
      try {
         const users = await User.find({ _id: { $nin: newArr } }).limit(5).select('-password')
         res.json({ users })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   getSuggestionUserWhenNoLogin: async (req: Request, res: Response) => {
      try {
         const users = await User.find().limit(5).select('-password')
         res.json({ users })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   getProfileUser: async (req: Request, res: Response) => {
      try {
         const user = await User.findById(req.params.id).select('-password').
         populate({
            path: 'liked',
            options: {
               sort: { createdAt: -1 },
            },
            populate: {
               path: 'user',
               select: '-password',
            },
         })
         .populate({
            path: 'liked',
            options: {
               sort: { createdAt: -1 },
            },
            populate: {
               path: 'comments',
               options: {
                  sort: { createdAt: -1 }
               },
               populate: {
                  path: 'user',
                  select: '-password',
               }
            }
         })
         .populate({
            path: 'liked',
            options: {
               sort: { createdAt: -1 },
            },
            populate: {
               path: 'comments',
               options: {
                  sort: { createdAt: -1 }
               },
               populate: {
                  path: 'reply',
                  options: {
                     sort: { createdAt: -1 }
                  },
                  populate: {
                     path: 'user',
                     select: '-password',
                  }
               }
            }
         })
         const videos = await Post.find({user: req.params.id}).sort('-createdAt')
         .populate('user', 'avatar name winterId following followers')
         .populate({
            path: 'comments',
            options: {
               sort: { createdAt: -1 },
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
         if (!user) return res.status(400).json({ msg: 'This User does not exist!' })
         res.json({ user: { ...user._doc, videos} })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   follow: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const user = await User.find({
            _id: req.params.id,
            followers: req.user._id
         })
         if (user.length > 0) return res.status(400).json({ msg: 'You followed this user!' })
         await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } }, { new: true })
         await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } }, { new: true })

         res.json({ msg: 'Follow Success!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   unfollow: async (req: IReqAuth, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const user = await User.find({
            _id: req.params.id,
            followers: req.user._id
         })
         if (user.length === 0) return res.status(400).json({ msg: 'You do not follow this use' })
         await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } }, { new: true })
         await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } }, { new: true })

         res.json({ msg: 'UnFollow Success!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   searchUser: async (req: Request, res: Response) => {
      try {
         const users = await User.aggregate([
            {
               $search: {
                  index: 'searchname',
                  autocomplete: {
                     "query": `${req.query.name}`,
                     "path": "name",
                  }
               },
            },
            { $limit: 5 },
            // Sort by the user have highest followers
            { $sort: { followers: -1 } },
            { $project: { password: 0 } }
         ])
         res.json({ users })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
}

export default userCtrl;