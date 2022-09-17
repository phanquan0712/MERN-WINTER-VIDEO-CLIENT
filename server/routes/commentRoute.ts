import express from 'express';
import commentCtrl from '../controllers/commentCtrl';
import auth from '../middleware/auth';
const router = express.Router();

router.route('/comment')
      .post(auth, commentCtrl.createComment);
      
router.post('/answer_comment/:id', auth, commentCtrl.createAnswerComment);
router.patch('/comment/:id/like', auth, commentCtrl.likeComment);
router.patch('/comment/:id/unlike', auth, commentCtrl.unLikeComment);
router.delete('/delete_comment/:id', auth, commentCtrl.deleteComment);

export default router;