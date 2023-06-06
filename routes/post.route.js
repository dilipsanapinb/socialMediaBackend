const express = require("express");

const { Post } = require("../models/post.model");

const { auth } = require("../middlewares/auth");
const { userRoute } = require("./user.route");

const postRoute = express.Router();

// get posts route
postRoute.get("/api/posts", async (req, res) => {
  try {
    let posts = await Post.find();
    res.status(200).send({ Message: "All Posts", Posts: posts });
  } catch (error) {
    console.log("Error: error at getting all posts data", error);
    res.status(500).send({ Message: error.message });
  }
});

// post by id

postRoute.get("/api/posts/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let post = await Post.findById(id);
    res.status(200).send({ Message: "Post By ID", Post: post });
  } catch (error) {
    console.log("Error: error at getting all posts data", error);
    res.status(500).send({ Message: error.message });
  }
});

// add post

postRoute.post("/api/posts", auth, async (req, res) => {
  let { text, image, createdAt, likes, comments } = req.body;
  let userID = req.body.userID;
  try {
    let post = new Post({ user:userID, text, image, createdAt, likes, comments });
    await post.save();
    res.status(200).send({ Messsage: "Post Added Successfully", Post: post });
  } catch (error) {
    console.log("Error: error at creating a new post", error);
    res.status(500).send({ Message: error.message });
  }
});

// patch post

postRoute.patch("/api/posts/:id", auth, async (req, res) => {
  let id = req.params.id;
  let payload = req.body;
  try {
    let post = await Post.findByIdAndUpdate({ _id: id }, payload);
    res
      .status(204)
      .send({ Message: "Post Updated Successfully", "Updated Post": post });
  } catch (error) {
    console.log("Error: error at updating a  post", error);
    res.status(500).send({ Message: error.message });
  }
});

// delete post

postRoute.delete("/api/posts/:id", auth, async (req, res) => {
  let { id } = req.params;
  try {
    await Post.findByIdAndDelete({ _id: id });
    res.status(200).send({ Message: "Post Deleted Successfully" });
  } catch (error) {
    console.log("Error: error at delete a  post", error);
    res.status(500).send({ Message: error.message });
  }
});

// like route
postRoute.post("/api/posts/:id/like", auth, async (req, res) => {
  let id = req.params.id;
  let userID = req.body.userID;
  try {
    let post = await Post.findById(id);
    if (post.likes.includes(userID)) {
      return res.status(400).send({ Message: "You allready liked the post" });
    }
    if (post.user.toString() == userID) {
      return res.status(400).send({ Message: "You cannot like your post" });
    }
    like = post.likes;
    like.push(userID);
    await post.save();
    res.status(200).send({ Message: "User liked post", Post: post });
  } catch (error) {
    console.log("Error: error at like a  post", error);
    res.status(500).send({ Message: error.message });
  }
});

// commet route

postRoute.post("/api/posts/:id/comment", auth, async (req, res) => {
    const { id } = req.params;
    let {user, text, createdAt } = req.body;
    let userId = req.body.userID;
    try {
        let comment = { text, createdAt, user:userId };
        console.log(comment);
        let post = await Post.findById(id);
        if (!post) {
            return res.status(400).send({"Message":"Post not found"})
        }
        let comments = post.comments;
        comments.push(comment);
        await post.save();
        res.status(200).send({ "Message": "Comment Added Successfully", "Post": post });
    } catch (error) {
        console.log("Error: error at comemnt on  post", error);
        res.status(500).send({ "Message": error.message });
    }
});

module.exports = { postRoute };
