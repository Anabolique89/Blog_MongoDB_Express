const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

//Check Login

const authMiddleware = (req, res, next) => {
  const token = req.cookie.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorised" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorised",
    });
  }
};

//GET - ADMIN LOGIN

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin Login & Command",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//POST - ADMIN Check Login

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._userid }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

// GET DASHBOARD

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Link to Admin Dashboard",
    };

    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

//POST - ADMIN Check REGISTER

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "Username already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//default admin login test

// router.post("/admin", async (req, res) => {
//     try {
//       const { username, password } = req.body;
//       console.log(req.body);
//       if (req.body.username === "admin" && req.body.password === "password") {
//         res.send("You are logged in");
//       } else {
//         res.send("Wrong username or password");
//       }

//       res.redirect("/admin");
//     } catch (error) {
//       console.log(error);
//     }
//   });

//export router
module.exports = router;
