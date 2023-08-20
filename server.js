const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

aoo.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos",
    { params: { albumId } }
  );
  res.json(data);
});
