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
  const token = req.cookies.token;
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

//POST - ADMIN REGISTER

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.redirect("/dashboard");
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//GET - ADMIN LOGIN PAGE

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin Login & Command",
    };

    res.render("admin/index", { locals, layout: adminLayout });
    // res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

//POST - ADMIN Login Authentication

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

// GET DASHBOARD PAGE

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

// + ADD NEW POST (Admin)

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Add a post",
    };

    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
    // res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

//POST - ADMIN ADD NEW POST

router.post("/add-post", async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);
      res.redirect("/dashboard");
      //   res.status(200).json(newPost);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

// GET - FETCH /EDIT POST
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Edit or View this post",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// PUT EDIT POST
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    // const data = await Post.findOne({ _id: req.params.id });
    res.redirect(`/edit-post/${req.params.id}`);
    // res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

//DELETE POST

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
    res.status(200).json("Post has been deleted");
  } catch (error) {
    console.log(error);
  }
});

// GET - ADMIN LOGOUT

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  //   res.json({ message: "Logout successful." });

  res.redirect("/");
  res.status(200).json("Admin has been logged out");
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

module.exports = router;
