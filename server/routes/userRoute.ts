import express from 'express';
import userCtrl from '../controllers/userCtrl';
import auth from '../middleware/auth';
const router = express.Router();

router.patch('/user', auth, userCtrl.updateUser);
router.get('/suggestion_user', auth, userCtrl.getSuggestionUser);
router.get('/suggestion_user_no_login', userCtrl.getSuggestionUserWhenNoLogin);
router.get('/profile_user/:id', userCtrl.getProfileUser);
router.patch('/user/:id/follow', auth, userCtrl.follow);
router.patch('/user/:id/unfollow', auth, userCtrl.unfollow);
router.get('/search_user',  userCtrl.searchUser)
router.get('/discover_user', auth, userCtrl.getDiscoverUser);
router.get('/discover_user_no_login', userCtrl.getDiscoverUserNoLogin);
export default router;