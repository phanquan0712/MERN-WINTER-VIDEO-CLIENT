const nodemailer = require('nodemailer');
import { OAuth2Client } from "google-auth-library";

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const CLIENT_ID = `${process.env.MAIL_CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.MAIL_CLIENT_SECRET}`;
const REFRESH_TOKEN = `${process.env.MAIL_REFRESH_TOKEN}`;
const SENDER_EMAIL = `${process.env.SENDER_EMAIL_ADDRESS}`;

// send mail
const sendMail = async (to: string, url: string, txt: string) => {
   const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, OAUTH_PLAYGROUND);
   oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
   try {
      const access_token = await oAuth2Client.getAccessToken();
      const transport = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: access_token,
         }
      })

      const mailOptions = {
         from: SENDER_EMAIL,
         to: to,
         subject: 'Winter Video App',
         html: `
         <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
         <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Winter Video App.</h2>
         <p>Congratulations! You're almost set to start using Winter.
         Just click the button below to validate your email address.
         </p>
         
         <a href=${url} style="text-align: center; background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
         </div>`,
      }
      const result = await transport.sendMail(mailOptions);
      return result;
   }
   catch (err) {
      console.log(err);
   }
}

export default sendMail;