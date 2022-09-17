import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import SocketServer from './config/SocketServer';
const app = express();
// Middleware
app.use(morgan('dev'));
app.use(cors({
   origin: `${process.env.BASE_URL}`,
   credentials: true
}));
app.use(cookieParser());
app.use(express.json({limit: '256mb'}));
app.use(express.urlencoded({ limit: '256mb',  extended: true }));

// Socket
const http = createServer(app);
const io = new Server(http, {
   cors: {
         origin: `${process.env.BASE_URL}`,
         credentials: true
   }
});
io.on('connection', (socket: Socket) => {
   SocketServer(socket);
})


// Routes
app.use('/api', routes.authRoute);
app.use('/api', routes.userRoute);
app.use('/api', routes.postRoute);
app.use('/api', routes.commentRoute);
app.use('/api', routes.messageRoute);
app.use('/api', routes.notifyRoute);

// Database
import './config/database';

// Server Listenning
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
   console.log(`Server started on port ${PORT}`);
})
