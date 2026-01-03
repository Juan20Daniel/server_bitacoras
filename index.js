require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`THE SERVER IS RUNNING ON PORT ${port}`);
});