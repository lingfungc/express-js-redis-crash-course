const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

// const client = Redis.createClient({ url: })
const redisClient = Redis.createClient();

// Set expiration to 1 hour
const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(cors());

app.get("/photos", async (req, res) => {
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos"
  );

  // This "photos" is the key of the key-value pair in our redis here
  // In redis, we can only store String, so we need to convert the data to String
  redisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));

  // const albumId = req.query.albumId;
  // console.log(albumId);

  // const { data } = await axios.get(
  //   "https://jsonplaceholder.typicode.com/photos",
  //   { params: { albumId } }
  // );

  res.json(data);
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
});

app.listen(3000, () => console.log("Server is listening to port 3000"));
