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

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });
    res.render("post", { data });
  } catch (error) {
    console.log(error);
  }
});

// POST

router.post("/search", async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

    const data = await Post.find({
      $or: [
        {
          title: { $regex: new RegExp(searchNoSpecialChar, "i") },
        },
        {
          body: { $regex: new RegExp(searchNoSpecialChar, "i") },
        },
      ],
    });

    res.render("search", {
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

//Testing the data insertion

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Multimedia Design & How It Became a Passion",
//       body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
//     },
//     {
//       title: "3 Graffiti Friendly Cities",
//       body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged....",
//     },
//     {
//       title: "Zurich only allows graffiti on a handful of walls",
//       body: "Zurich only allows graffiti on a handful of walls. On the upside, the main spots are super central and thus get huge attention. At the Letten bath you can join locals indulging in their favourite summer activity of swimming in the Limmat river.",
//     },
//     {
//       title: "Legal Graffiti Report",
//       body: "The graffiti landscape has changed a lot in the last decade. The rise of streetart has also made graffiti more accessible to the general public. Graffiti artists like Smash or Askew who have painted illegally for years, are now selling their artwork in galleries.",
//     },
//     {
//       title: "Walls of thoughts and thoughts in walls",
//       body: "Lorem Ipsum sit amet .....",
//     },
//     {
//       title: " Vienna offers a staggering amount of wall space to artists",
//       body: "With over 20 walls, the city of Vienna offers a staggering amount of wall space to artists. Some of them are nicely located along the river Donau, and are pretty idyllic to paint. Well worth a visit!",
//     },
//     {
//       title: "Wienerwand",
//       body: "Im Rahmen des Projektes Wienerwand bietet die Stadt Wien jungen Künstler*innen aus der Graffitiszene legale Graffiti-Flächen an. Die Flächen werden durch die “Wiener Taube” als Wienerwand gekennzeichnet.",
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
