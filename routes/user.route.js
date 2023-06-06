const express = require("express");

const { User } = require("../models/user.model");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { auth } = require("../middlewares/auth");

require("dotenv").config();

const userRoute = express.Router();

userRoute.post("/api/register", async (req, res) => {
  let {
    name,
    email,
    password,
    dob,
    bio,
    posts,
    friends,
    friendRequests,
    rejectedFriendRequests,
  } = req.body;
  try {
    bcrypt.hash(password, 5, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        console.log("Error: error at register the user", err);
        res.status(404).send({ Message: err.message });
      } else {
        let user = new User({
          name,
          email,
          password: hash,
          dob,
          bio,
          posts,
          friends,
          friendRequests,
          rejectedFriendRequests,
        });
        await user.save();
        res
          .status(201)
          .send({ Messsage: "User Registered Successfully", User: user });
      }
    });
  } catch (error) {
    console.log("Error: error at register the user", error);
    res.status(500).send({ Message: error.message });
  }
});

userRoute.post("/api/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await User.findOne({ email: email });
  let hashPass = user.password;
  try {
    bcrypt.compare(password, hashPass, function (err, result) {
      // result == true
      if (result) {
        var token = jwt.sign({ userID: user._id }, process.env.key);
        res
          .status(201)
          .send({ Message: "User Logged in successfully", token: token });
      } else {
        console.log("Error: error at register the user", err);
        res.status(404).send({ Message: err.message });
      }
    });
  } catch (error) {
    console.log("Error: error at login the user", error);
    res.status(500).send({ Message: error.message });
  }
});

// get All users

userRoute.get("/api/users", async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).send({ Message: "All Users Data", Users: users });
  } catch (error) {
    console.log("Error: error at getting all users data", error);
    res.status(500).send({ Message: error.message });
  }
});

// list of all friends
userRoute.get("/api/users/:id/friends", async (req, res) => {
    let id = req.params.id;
    try {
        let user = await User.findById(id).populate(
            "friends",
            "name email bio dob"
        )
            .exec();
        let friends = user.friends;
        res.status(200).send({ "Message": "All Friends of User", "Friends": friends });
    } catch (error) {
        console.log("Error: error at getting all friends of user", error);
        res.status(500).send({ Message: error.message });
    }
});

// send Fried req

userRoute.post("/api/users/:id/friends", auth, async (req, res) => {
  let tagetId = req.params.id;
  let userId = req.body.userID;
  let user = await User.findById(userId);

  try {
    let targetUser = await User.findById(tagetId);

    if (!targetUser) {
      return res.status(404).send("User Not Found");
      }
      if (targetUser.friendRequests.includes(userId)) {
          return res.status(400).send({ "Message":"Friend request sent allready"})
      }
      if (user.friendRequests.toString() == id) {
          return res.status(400).send("You cannot send friend request to yourself")
      }
    targetUser.friendRequests.push(userId);
    await targetUser.save();
    user.friendRequests.push(tagetId);
    await user.save();

    res.status(201).send({ Message: "Friend Request sent successfully","User":user,"TargetUser":targetUser });
  } catch (error) {
    console.log("Error: error at sending the friend request", error);
    res.status(500).send({ "Message": error.message });
  }
});

userRoute.patch("/api/users/:id/friends/:friendId",auth,async (req, res) => {
    const { id, friendId } = req.params;

    const requestingUser = await User.findById(friendId);
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).send("User Not Found")
    }

    let userindexOfFriendReq = user.friendRequests.indexOf(friendId);
    let friendindexOfFriendReq = requestingUser.friendRequests.indexOf(id);

    if (!userindexOfFriendReq) {
        return res.status(400).send({"Message":"Friend Request Not Found"})
    }
    user.friendRequests.splice(userindexOfFriendReq, 1);
    requestingUser.friendRequests.splice(friendindexOfFriendReq, 1);
    if (req.body.accept) {
        user.friends.push(friendId);
        requestingUser.friends.push(id);
    } else {
        user.rejectedFriendRequests.push(friendId);
    }

    await user.save();
    await requestingUser.save();

    res.status(201).send({"Message":"Friends List Updated Successfully","User":user})



})
module.exports = { userRoute };
