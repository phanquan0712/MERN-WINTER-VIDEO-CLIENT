import { OAuth2Client } from 'google-auth-library';
import { generateAccessToken, generateRefreshToken } from './../config/generateToken';
import { Request, Response } from "express";
import User from "../models/UserModel";
import bcrypt from "bcrypt";
import { generateActiveToken } from "../config/generateToken";
import { validateEmail, vailidPhoneNumber  } from "../middleware/validRegister";
import sendMail from "../config/sendMail";
import { sendSMS, smsOTP, smsVerify } from "../config/sendSms";
import jwt  from "jsonwebtoken";
import {IDecoded, IGgPayload, IUserGoogle, IUser, IReqAuth } from "../config/interface";
import fetch from "node-fetch";


const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`)

const CLIENT_URL = `${process.env.BASE_URL}`;

const authCtrl = {
   register: async (req: Request, res: Response) => {
      try {
         const { winterId, name, account, password } = req.body;
         const user = await User.findOne({
            $or: [
               { account },
               { winterId }
            ]
         });
         if (user) return res.status(400).json({ msg: 'Account or winterId already exists' });

         const passwordHash = await bcrypt.hash(password, 12);

         const newUser = {
            winterId: winterId ? winterId : '',
            name,
            account,
            password: passwordHash,
         }

         const active_token = generateActiveToken({newUser})
         const url = `${CLIENT_URL}/active/${active_token}`;
         if(validateEmail(account)) {
            sendMail(account, url, 'Verify your account');
            res.json({
               msg: 'Register Success! Please check your email to verify your account',
            })
         }
         else if(vailidPhoneNumber(account)) {
            sendSMS(account, url, 'Verify your account');
            res.json({
               msg: 'Register Success! Please check your phone to verify your account',
            })
         }
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   activeAccount: async (req: Request, res: Response) => {
      try {
         const { active_token } = req.body;
         const decoded = <IDecoded>jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SERECT}`)
         const { newUser } = decoded;
         const user = await User.findOne({ 
            $or: [
               { account: newUser?.account },
               { winterId: newUser?.winterId }
            ]
         })
         if(user) return res.status(400).json({ msg: 'This account is already active' })
         const new_user = new User(newUser);
         await new_user.save();
         res.json({ msg: 'Account has been active!' })
      } catch(err: any) {
         console.log(err)
         return res.status(500).json({ msg: err.message })
      }
   },
   login: async (req: Request, res: Response) => {
      try {
         const { account, password } = req.body;
         const user = await User.findOne({ account }).populate('following followers liked', '-password');
         if(!user) return res.status(400).json({ msg: 'This account does not exist!'})
         // if user exist
         loginUser(user, password, res);
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   logout: async (req: IReqAuth, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         res.clearCookie('refreshtoken', { path: `/api/refresh_token` });
         res.json({ msg: 'Logout Success!' })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   refreshToken: async (req: Request, res: Response) => {
      try {
         const rf_token = req.cookies.refreshtoken;
         if(!rf_token) return res.status(400).json({ msg: 'Please, login now!' })
         const decoded = <IDecoded>jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SERECT}`)
         if(!decoded.id) return res.status(400).json({ msg: 'Please, login now!' })
         const user = await User.findById(decoded.id).populate('following followers liked', '-password');
         if(!user)   return res.status(400).json({ msg: 'This account does not exist!' })
         const access_token = generateAccessToken({id: user._id});
         res.json({access_token, user})
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   googleLogin: async (req: Request, res: Response) => {
      try {
         const { id } = req.body;
         const verify = await client.verifyIdToken({
            idToken: id, audience: `${process.env.MAIL_CLIENT_ID}`
         })
         const { email, email_verified, name, picture } = <IGgPayload>verify.getPayload();
         if(!email_verified) return res.status(400).json({ msg: 'Email varifycation failed!' });
         const password = email + 'your account google password';
         const passwordHash = await bcrypt.hash(password, 12);
         
         const user = await User.findOne({ account: email }).populate('following followers liked', '-password');
         if(user) {
            loginUser(user, password, res);
         } else {
            const new_user = {
               winterId: '',
               name,
               account: email, 
               password: passwordHash,
               avatar: picture,
               type: 'google'
            }
            registerUser(new_user, res);
         }

      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   facebookLogin: async (req: Request, res: Response) => {
      try {
         const { token, id } = req.body;
         const url = `https://graph.facebook.com/v3.0/${id}/?fields=id,first_name,last_name,middle_name,email,picture&access_token=${token}`;
         const data = await fetch(url)
         .then(res => res.json())
         .then(res => res);

         const { first_name, last_name, email, picture } = data;
         const password = email + 'your account facebook password';
         const passwordHash = await bcrypt.hash(password, 12);

         const user = await User.findOne({ account: email }).populate('following followers liked', '-password');
         if(user) {
            loginUser(user, password, res);
         } else {
            const new_user = {
               winterId: '',
               name: `${last_name} ${first_name}`,
               account: email,
               password: passwordHash,
               avatar: picture.data.url,
               type: 'facebook'
            }
            registerUser(new_user, res);
         }

      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   loginSms: async (req: Request, res: Response) => {
      try {
         const { phone } = req.body;
         const data = await smsOTP(phone, 'sms')
         res.json(data)
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   verifySms: async (req: Request, res: Response) => {
      try {
         const { phone, code } = req.body;
         const data = await smsVerify(phone, code);
         if (!data?.valid) return res.status(400).json({ msg: 'Invalid Authentication!' })

         const password = phone + 'your phone serect password';
         const passwordHash = await bcrypt.hash(password, 12);
         const user = await User.findOne({ account: phone }).select('-password').populate('following followers liked', '-password');

         if (user) {
            loginUser(user, password, res);
         }
         else {
            const new_user = {
               name: phone,
               account: phone,
               password: passwordHash,
               type: 'sms'
            }
            registerUser(new_user, res);
         }
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }
}

const loginUser = async (user: IUser, password: string, res: Response) => {
   const isMatch = await bcrypt.compare(password, user.password);
   if(!isMatch) return res.status(400).json({ msg: 'Password is incorrect' })

   const access_token = generateAccessToken({id: user._id});
   const refresh_token = generateRefreshToken({id: user._id}, res);

   res.json({
      msg: 'Login Success!',
      access_token,
      user: {...user._doc, password: ''},
   })
}  

export const registerUser = async(user: IUserGoogle, res: Response) => {
   const new_user = new User(user);
   const access_token = generateAccessToken({id: new_user._id});
   const refresh_token = generateRefreshToken({id: new_user._id}, res);

   await new_user.save();
   res.json({
      msg: 'Login Success!',
      access_token,
      user: { ...new_user._doc, password: '' }
   })
}

export default authCtrl;