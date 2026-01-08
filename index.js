require('dotenv').config();
const express = require('express');
const app = express();
const v1Routes = require('./src/v1Routes');
const {testConnection, sequelizeConfig} = require('./src/database/sequelizeConfig');
require('./src/models');
const port = process.env.SERVER_PORT || 3000;

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando conexión DB...');
  await sequelizeConfig.close();
  process.exit(0);
});

const server = async () => {
  try {
    //probar conexión a la base de datos
    await testConnection();
    //Sincronizar tablas
    await sequelizeConfig.sync({ alter: true });

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
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

server();