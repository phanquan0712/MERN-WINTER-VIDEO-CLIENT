import { IReqAuth } from './../config/interface';
import Message from "../models/messageModel";
import Conversation from "../models/conversationModel";
import { Request, Response } from 'express';


class ApiFeatures {
   query: any;
   queryString: any;
   constructor(query: any, queryString: any) {
      this.query = query;
      this.queryString = queryString;
   }
   paginating() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 15;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this
   }
}

const messageCtrl = {
   createMessage: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { recipient, text } = req.body;
         if(!recipient || (!text)) return;

         // Create new conversaiton
         const newConversation = await Conversation.findOneAndUpdate({
            $or: [
               { recipients: [recipient, req.user._id]},
               { recipients: [req.user._id, recipient] },
            ]
         },
         {
            recipients: [req.user._id, recipient],
            text
         }, { new: true, upsert: true})

         const message = new Message({
            conversation: newConversation._id,
            sender: req.user._id,
            recipient,
            text,
         })
         await message.save();
         res.json({ newConversation, message })

      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getConversations: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const conversations = await Conversation.find({ recipients: { $in: [req.user._id] } })
         .sort({ updatedAt: -1 }).populate('recipients', 'avatar name winterId')
         res.json({ conversations, total: conversations.length })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getMessage: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const features = new ApiFeatures(Message.find({
            $or: [
               { sender: req.user._id, recipient: req.params.id},
               { sender: req.params.id, recipient: req.user._id }
            ]
         }), req.query).paginating()
         const messages = await features.query.sort({ createdAt: -1 }).populate('sender recipient', 'avatar name winterId')
         res.json({ messages, total: messages.length })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   deleteConversation: async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const conversation = await Conversation.findByIdAndDelete(req.params.id)
         if(conversation) {
            await Message.deleteMany({ conversation: req.params.id })
         }
         res.json({ msg: 'Deleted Conversation!' })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   deleteMessage : async(req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         await Message.findByIdAndDelete(req.params.id)
         res.json({ msg: 'Deleted Message!' })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }
}


export default messageCtrl;