const mongoose = require('mongoose');
const { logger } = require('../middlewares/logger.middleware');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('Conexión a MongoDB exitosa');
    } catch (error) {
        logger.error(`Error al conectar a MongoDB: ${error.message}`);
        process.exit(1); // Detiene la app si no puede conectar a la BD
    }
};

module.exports = connectDB;
