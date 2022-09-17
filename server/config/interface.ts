import { Request } from 'express';


export interface IUser {
   _id: string
   winterId: string
   name: string
   account: string
   password: string
   avatar: string
   role: string
   type: string
   story: string
   followers: string[]
   following: string[]
   liked: string[]
   _doc: Document
}



export interface INewUser {
   winterId: string
   account: string
   name: string
   password: string
}

export interface IUserGoogle {
   name: string
   account: string
   password: string
   avatar?: string
   type: string
}

export interface IDecoded{
   id?: string
   newUser?: INewUser
   iat: number
   exp: number
}

export interface IGgPayload {
   email: string
   email_verified: boolean
   name: string
   picture: string
}

export interface IReqAuth extends Request {
   user?: IUser
}


export interface IPost {
   _id?: string
   user: string
   comments: string[]
   likes: string[]
   video: string
   note: string
   isComment: boolean
   roleWatcher: string
   _doc: Document
}

export interface IComment {
   _id?: string
   user: string
   postId: string
   postUserId: string
   content: string
   likes: string[]
   tag: string
   comment_root: string
   reply: string[]
   _doc: Document
}


export interface IMessage {
   _id?: string
   sender: string
   recipient: string
   text: string
   media: string[]
   call: string
   createdAt?: string
   _doc: Document
}

export interface INotify {
   _id?: string
   id: string
   recipients: string[]
   url: string
   text: string
   content: string
   image: string
   user: string
   createdAt?: string
   _doc: Document
}