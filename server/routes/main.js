const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//homepage route
//GET
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with Nodejs, Express & MongoDB.",
    };
    //pagination
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

//GET * Post :id

router.get('/post/:id', async (req, res) => {
  try{
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });
    res.render('post', {data});
  } catch(error) {
    console.log(error);
  }
})






//Testing the data insertion

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Building a blog",
//       body: "This is the body text",
//     },
//     {
//       title: "Lorem Ipsum",
//       body: "This is the body text",
//     },
//   ]);
// }

// insertPostData();

//about route
router.get("/about", (req, res) => {
  res.render("about");
});

//export router
module.exports = router;
