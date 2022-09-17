import { Request, Response, NextFunction } from "express";

export const validRegister = async (req: Request, res: Response, next: NextFunction) => {
   const { winterId, name, account, password } = req.body;
   const errors: string[] = []
   if (winterId.length > 30) errors.push('Your winterId is up to 30 chars long')
   if (!name) errors.push('Please, Add your name!')
   else if(name.length > 30) errors.push('Your name is up to 30 chars long')
   if (!account) errors.push('Please, Add your email or phone number!')
   else if(!validateEmail(account) && !vailidPhoneNumber(account)) errors.push('Email or phone number format is incorrect!')
   if (!password) errors.push('Please, Add your password!')
   else if(password.length < 6) errors.push('Your password is up to 6 chars long')
   if(errors.length > 0) return res.status(400).json({ msg: errors })
   next();
}

export const validateEmail = (email: string) => {
   return String(email)
      .toLowerCase()
      .match(
         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};

export function vailidPhoneNumber(phone: string) {
   const re = /^[+]/g;
   return re.test(phone);
}