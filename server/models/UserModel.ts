import mongoose from "mongoose";
import { IUser } from "../config/interface";


const userSchema = new mongoose.Schema({
   winterId: {
      type: String,
      unique: true,
      trim: true,
      toLowerCase: true,
      maxLength:[30, 'Your winterId is up to 30 chars long']
   },
   name: {
      type: String,
      required: true,
      trim: true,
      maxLength:[30, 'Your name is up to 30 chars long']
   },
   account: {
      type: String,
      trim: true, 
      unique: true,
      require: [true, 'Please, Add your email or phone number!']
   },
   password: {
      type: String,
      require: [true, 'Please, Add your password!'],
      minLength: [6, 'Your password is up to 6 chars long']
   },
   avatar: {
      type: String,
      default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
   },
   role: {
      type: String,
      default: 'user' // admin
   },
   type: {
      type: String,
      default: 'register', //Social, Phone number and email
   },
   story: {
      type: String,
      maxLength: [80, 'Your story is up to 80 chars long'],
      default: 'No story',
      trim: true,
   },
   roleChat: {
      type: String,
      default: 'friend'
   },
   followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });


export default mongoose.model<IUser>('User', userSchema);