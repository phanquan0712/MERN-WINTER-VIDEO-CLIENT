import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';
import jwt from 'jsonwebtoken';
import { IDecoded, IReqAuth, IUser } from '../config/interface';

const auth = async (req: IReqAuth, res: Response, next: NextFunction) => {
   try {
      const token = req.header('Authorization')
      if (!token) return res.status(400).json({ msg: 'Invalid Authentication' })
      const decode = <IDecoded>jwt.verify(token, `${process.env.ACCESS_TOKEN_SERECT}`)
      if (!decode) return res.status(400).json({ msg: 'Invalid Authentication' })
      const user = await User.findById(decode.id).select('-password')
      if (!user) return res.status(400).json({ msg: 'The user does not exist' })
      req.user = user;
      next();
   }
   catch (err: any) {
      return res.status(500).json({ msg: err.message })
   }
}



export default auth;
