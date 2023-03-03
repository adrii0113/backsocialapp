const router = require("express").Router();
const Post = require("./../models/Posts");
const User = require("./../models/User");
const Comment = require("./../models/Comments");
const Posts = require("./../models/Posts");

// obtener todos los post de todos los usuarios
router.get("/all", async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(err);
  }
});

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});


//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    // } else {
    //   res.status(403).json("you can delete only your post");
    // }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

router.get("/timeline/:userId", async (req, res) => {
  console.log("llleha")
  // console.log(req.params.userId)
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    console.log(userPosts)
    const friendPosts = await Promise.all(
      currentUser.seguidos.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
    // res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err);
  }
});
//get user's all posts

router.get("/profile/:nombreUsuario", async (req, res) => {
  try {
    const user = await User.findOne({ nombreUsuario: req.params.nombreUsuario });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});


// comment a post 

router.post("/comment/", async (req, res) =>{
  const newComment = new Comment(req.body);
  try {
    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (error) {
    console.log(error)
  }
})


router.put("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post)
    // await post.updateOne({ $push: { comments: req.body.userId} });
    
  } catch (err) {
    res.status(500).json(err);
  }
});


router.delete("/deleteposts/:userdId", async (req,res) =>{
  console.log("s")
  const userId = req.params.userdId;
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({ userId: user._id });
    await Posts.deleteMany({userId: user._id});

    res.status(200).json(posts);

  } catch (error) {
    console.log(error)
  }
})




module.exports = router;