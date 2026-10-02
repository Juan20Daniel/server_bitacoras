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

    app.use(express.json({ limit: '20mb' }));
    app.use(express.urlencoded({ limit: '20mb', extended: true }));
    app.use('/api/v1', v1Routes);
    app.use((req, res) => {
      res.status(404).json({message:'Route not found'});
    })
    app.use((err, req, res, next) => {
      if(err.isOperational) {
        console.log(err)
        return res.status(err.status).json({
          errorCode: err.errorCode,
          message: err.message
        });
      }
      console.log(err);
      res.status(500).json({
          errorCode: 'UNKNOWN_ER',
          message: 'Error desconocido'
        });
    });

    app.listen(port,'0.0.0.0', () => {
      console.log(`THE SERVER IS RUNNING ON PORT ${port}`);
    });
  } catch (error) {
  
    console.log(error);
    process.exit(1);
  }
}

server();