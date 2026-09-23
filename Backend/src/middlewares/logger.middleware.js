const winston = require('winston');
const morgan = require('morgan');

const { combine, timestamp, printf, colorize } = winston.format;

// Formato personalizado para ver los logs bonitos en la consola (desarrollo)
const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Configuración del Logger usando Winston
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    // En producción es mejor tener logs en formato JSON estructurado
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json() 
    ),
    transports: [
        // Opcional: escribir los errores a un archivo (dentro del contenedor se perderá a menos que montes un volumen)
        // Por ahora, se dejarán en consola que Docker sabe atrapar.
        new winston.transports.Console()
    ]
});

// Sobrescribir el formato de consola si estamos en desarrollo
if (process.env.NODE_ENV !== 'production') {
    logger.clear(); // Quitar el formato JSON de consola
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            customFormat
        )
    }));
}

// Configuración de Morgan para loguear peticiones HTTP y redirigirlas a Winston
const httpLogger = morgan('combined', {
    stream: {
        // Usa el nivel 'http' o 'info' de winston para registrar los requests
        write: (message) => logger.info(message.trim())
    }
});

module.exports = {
    logger,
    httpLogger
};
