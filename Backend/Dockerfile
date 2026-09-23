# Usa una imagen ligera de Node.js
FROM node:20-alpine

# Crea y define el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala SOLO las dependencias de producción (omite nodemon, faker, etc.)
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# Expone el puerto
EXPOSE 3000

# Comando para iniciar la aplicación (sin nodemon)
CMD ["node", "src/server.js"]
