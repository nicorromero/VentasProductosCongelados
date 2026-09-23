# Etapa 1: Construcción (Build) con Node.js
FROM node:20-alpine AS build

WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el código fuente
COPY . .

# Argumentos de build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

# Ejecuta el build de Vite (genera la carpeta /dist)
RUN npm run build

# Etapa 2: Servir los estáticos con Nginx (imagen muy ligera)
FROM nginx:alpine

# Reemplaza la configuración por defecto de Nginx con la nuestra
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia la carpeta /dist generada en la Etapa 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
