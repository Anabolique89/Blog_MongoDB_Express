const express = require("express");
const router = express.Router();

//homepage route
router.get("", (req, res) => {
  const locals = {
    title: "NodeJs Blog",
    description: "Simple Blog created with Nodejs, Express & MongoDB.",
  };

  res.render("index", { locals });
});

//about route
router.get("/about", (req, res) => {
  res.render("about");
});

//export router
module.exports = router;
