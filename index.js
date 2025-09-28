require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Seguridad básica
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parser para JSON
app.use(express.urlencoded({ extended: true })); // Parser para formularios

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API Pawsitive funcionando correctamente',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar conexión a BD
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      message: 'Conexión a la base de datos exitosa',
      database: process.env.DB_NAME,
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al conectar con la base de datos',
      error: error.message,
      status: 'error'
    });
  }
});

// Rutas de la API
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    status: 'error',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    status: 'error'
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
  }
});