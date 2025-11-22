const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const bcrypt = require('bcrypt');

// middleware
require("dotenv").config();
app.use(cors());
app.use(express.json());


// log report
app.use(async (req, res, next) => {
  console.log(`⚡ ${req.method} - ${req.path} from ${ req.host} at ⌛ ${new Date().toLocaleString()}`);
  next();
});


//ports & clients [MongoDB]
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


//listeners
client.connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening ${port}`);
      console.log(`Server Connected to MongoDB`);
    });
  })
  .catch((err) => {
    console.log(err);
  });


//DB & collections
const database = client.db("zap_shift");
const user_collection = database.collection("user");




/* API Calls */


// Basic routes
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "ZapShift Server Active" });
});


// registering user
app.post("/registration", async(req, res) => {

  try {
    const newUser = req.body;
    const email = newUser.email;
    const password = newUser.password;

    // check if user already exists
    const exists = await user_collection.findOne({email});
    if (exists) {
      return res.status(400).json({message: "User already exists."})
    }

    // hash password
    const hashed_password = await bcrypt.hash(password, 10);

    // insert data
    const updateInfo = {...newUser, password: hashed_password};
    await user_collection.insertOne(updateInfo);
    res.status(201).json({message: "User registration successful."})
  }
  catch(error){
    console.log(error.message);
    res.status(500).json({ message: "Internal server error." });
  }
})


//404
app.all(/.*/, (req, res) => {
  res.status(404).json({
    status: 404,
    error: "API not found",
  });
});