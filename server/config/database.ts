import mongoose, { ConnectOptions } from "mongoose";


const URL = `${process.env.MONGODB_URI}`;
mongoose.connect(URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
} as ConnectOptions, (err) => {
   if(err) throw err;
   console.log('MongoDB connected');
})