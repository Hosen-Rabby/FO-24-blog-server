const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const Post = require("./models/Post");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fileUpload = require("express-fileupload");

require("dotenv").config();
// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// const uri =
//   "mongodb+srv://blog:xXDjVcg0nukaSGif@cluster0.smfjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.smfjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// datas

async function run() {
  try {
    await client.connect();
    console.log("Connected to the database.");

    // collections
    const database = client.db("blog");
    const blogCollection = database.collection("blogs");

    // get blogs
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // get blogs
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const blog = await blogCollection.findOne(query);
      res.send(blog);
    });

    app.post("/blog", uploadMiddleware.single("file"), async (req, res) => {
      const { originalname, path } = req.file;
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
      });
      res.json(postDoc);
      // });
    });

    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.json(result);
    });

    // update blog
    app.put("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const blog = req.body;
      option = { upsert: true };
      updatedBlog = {
        $set: {
          name: blog.name,
          summary: blog.summary,
          content: blog.content,
        },
      };
      const result = await blogCollection.updateOne(
        filter,
        updatedBlog,
        option
      );
    });

    // delete a blog
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello...");
});

app.listen(port, () => {
  console.log(`Listening ${port}`);
});
