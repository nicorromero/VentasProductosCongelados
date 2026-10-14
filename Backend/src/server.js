require('dotenv').config();
const connectDB              = require('./config/database');
const app                    = require('./app');
const { logger }             = require('./middlewares/logger.middleware');
const { iniciarReportsJob }    = require('./jobs/reportsJob');
const { iniciarExcelSyncJobs }  = require('./jobs/excelSyncJob');

const PORT = process.env.PORT || 3000;

// Conectar a la base de datos y luego iniciar servicios
connectDB().then(() => {
    // Registrar el cron de reportes una vez que la DB está disponible
    iniciarReportsJob();
    // Registrar los cron jobs de sincronización inteligente con Excel (cierre de caja y sugerencia de precios)
    iniciarExcelSyncJobs();
});

app.listen(PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${PORT}`);
});