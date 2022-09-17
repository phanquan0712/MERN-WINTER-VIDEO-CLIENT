import express from 'express';
import auth  from '../middleware/auth';
import messageCtrl from '../controllers/messageCtrl';
const router = express.Router();

router.post('/message', auth, messageCtrl.createMessage)
router.get('/conversations', auth, messageCtrl.getConversations)
router.get('/messages/:id', auth, messageCtrl.getMessage)
router.delete('/delete_conversation/:id', auth, messageCtrl.deleteConversation)
router.delete('/delete_message/:id', auth, messageCtrl.deleteMessage)
export default router;

