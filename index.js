require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const v1Routes = require('./src/v1Routes');

app.use(express.json());
app.use('/api/v1', v1Routes);
app.use((req, res) => {
    res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

app.listen(port, () => {
  console.log(`THE SERVER IS RUNNING ON PORT ${port}`);
});