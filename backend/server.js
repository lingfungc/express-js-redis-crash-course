const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

// const client = Redis.createClient({ url: })
const redisClient = Redis.createClient();

// Set expiration to 1 hour
const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  redisClient.on("error", (err) => console.log("Redis Client Error:", err));

  await redisClient.connect();

  // redisClient.del("photos");

  const photosData = await redisClient.get("photos");
  console.log(`This is photoData: ${photosData}`);

  if (photosData != null) {
    console.log("Cache hit");
    res.json(JSON.parse(photosData));
  } else {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos"
    );
    // This "photos" is the key of the key-value pair in our redis here
    // In redis, we can only store String, so we need to convert the data to String
    redisClient.set("photos", JSON.stringify(data));
    redisClient.expire("photos", DEFAULT_EXPIRATION);
    res.json(data);
  }

  await redisClient.quit();

  // redisClient.get("photos", async (error, photos) => {
  //   if (error) console.error(error);
  //   if (photos != null) {
  //     console.log("Cache hit");
  //     return res.json(JSON.parse(photos));
  //   } else {
  //     const { data } = await axios.get(
  //       "https://jsonplaceholder.typicode.com/photos"
  //     );
  //     // This "photos" is the key of the key-value pair in our redis here
  //     // In redis, we can only store String, so we need to convert the data to String
  //     redisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
  //   }
  //   res.json(data);

  // const albumId = req.query.albumId;
  // console.log(albumId);

  // const { data } = await axios.get(
  //   "https://jsonplaceholder.typicode.com/photos",
  //   { params: { albumId } }
  // );
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
});

// URL reference: http://localhost:3000/photos
app.listen(3000, () => console.log("Server is listening to port 3000"));
