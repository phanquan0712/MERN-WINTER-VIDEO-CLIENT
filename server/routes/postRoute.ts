import express from "express";
import postCtrl from "../controllers/postCtrl";
import auth from "../middleware/auth";
const router = express.Router();

router
  .route("/post")
  .post(auth, postCtrl.createPost)
  .get(postCtrl.getHomePost)
  .patch(auth, postCtrl.updatePost);
router.patch("/post/:id/like", auth, postCtrl.likePost);
router.patch("/post/:id/unlike", auth, postCtrl.unLikePost);
router.get("/post_following", auth, postCtrl.getPostFollowing);
router.get("/post_detail/:id", postCtrl.getDetailPost);
router.delete("/post/:id", auth, postCtrl.deletePost);
router.patch("/post/:id", auth, postCtrl.updatePost);
router.get('/search_post', postCtrl.searchPost)
export default router;
