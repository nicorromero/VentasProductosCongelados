require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');
const { logger } = require('./middlewares/logger.middleware');

const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB();

app.listen(PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${PORT}`);
});