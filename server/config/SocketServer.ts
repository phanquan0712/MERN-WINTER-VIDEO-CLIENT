import { Socket } from 'socket.io';
let users: any[] = [];


const checkExist = (data: any, socket: Socket) => {
   const user = users.find(item => (item.id === data._id && item.socketId == socket.id))
   if (user) return
   else users.push({ id: data._id, socketId: socket.id })
}

const SocketServer = (socket: Socket) => {
   // Join User
   socket.on('joinUser', (user: any) => {
      if (users.every(item => item.id !== user._id)) {
         checkExist(user, socket)
      }
      console.log(users);
   })
   // Disconnect
   socket.on('disconnect', () => {
      users = users.filter(user => user.socketId !== socket.id)
      console.log(users);
   })
   
   // Message
   socket.on('addMessage', (msg: any) => {
      console.log(msg)
      const user = users.find(user => user.id === msg.recipient?._id)
      user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg)
   })

   socket.on('deleteMessage', (msg: any) => {
      console.log(msg)
      const user = users.find(user => user.id === msg.recipient?._id)
      user && socket.to(`${user.socketId}`).emit('deletMessageToClient', msg)
   })

   socket.on('deleteConversation', (cv: any) => {
      // console.log(cv)
      const user = users.find(user => user.id === cv._id)
      console.log(user)
      user && socket.to(`${user.socketId}`).emit('deleteConversationToClient', cv)
   })

   // Comment
   socket.on('deleteComment', (cm: any) => {
      console.log(cm)
      users.forEach(user => {
         socket.to(`${user.socketId}`).emit('deleteCommentToClient', cm)
      })
   })

   // Post
   socket.on('updatePost', (data: any) => {
      console.log(data)
      users.forEach(user => {
         socket.to(`${user.socketId}`).emit('updatePostToClient', data)
      })
   })

   socket.on('deletePost', (postId: string) => {
      console.log(postId)
      users.forEach(user => {
         socket.to(`${user.socketId}`).emit('deletePostToClient', postId)
      })
   })

   // Notify
   socket.on('createNotify', (data: any) => {
      const client = users.find(item => data.recipients.includes(item.id))
      client && socket.to(`${client.socketId}`).emit('createNotifyToClient', data)
   })

   socket.on('deleteNotify', (data: any) => {
      const client = users.find(item => data.recipients.includes(item.id))
      client && socket.to(`${client.socketId}`).emit('deleteNotifyToClient', data)
   })
}


export default SocketServer;