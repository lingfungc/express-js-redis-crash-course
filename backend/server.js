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

  // When user add key-value pairs in query params
  const albumId = req.query.albumId;
  console.log(`This albumId: ${albumId}`);

  let urlComponent;

  if (albumId == null) {
    urlComponent = "photos";
    console.log(urlComponent);
  } else {
    urlComponent = `photos?albumId=${albumId}`;
    console.log(urlComponent);
  }

  const photosData = await redisClient.get(`${urlComponent}`);
  console.log(`This is photoData: ${photosData}`);

  if (photosData != null) {
    console.log("Cache Hit\n");

    res.json(JSON.parse(photosData));
  } else {
    console.log("Cache Miss\n");

    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/${urlComponent}`
    );

    if (albumId == null) {
      redisClient.set(`photos`, JSON.stringify(data));
      redisClient.expire(`photos`, DEFAULT_EXPIRATION);
    } else {
      // This "photos" is the key of the key-value pair in our redis here
      // In redis, we can only store String, so we need to convert the data to String
      redisClient.set(`photos?albumId=${albumId}`, JSON.stringify(data));
      redisClient.expire(`photos?albumId=${albumId}`, DEFAULT_EXPIRATION);
    }
    res.json(data);
  }

  await redisClient.quit();
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
});

// URL reference: http://localhost:3000/photos
app.listen(3000, () => console.log("Server is listening to port 3000\n"));
