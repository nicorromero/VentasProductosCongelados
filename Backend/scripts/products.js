const mongoose = require('mongoose');
require('dotenv').config();

const { faker } = require('@faker-js/faker');
const Product = require('../src/models/product.model.js');

// Constante con links reales de imágenes 
// //Se genera UN producto por link, sin repetir.
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
  'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
  'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
  'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&q=80',
  'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80',
  'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80',
  'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
  'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&q=80',
  'https://images.unsplash.com/photo-1542219550-37153d387c27?w=600&q=80',
  'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80',
];

const CATEGORIAS = ['hombre', 'mujer', 'niños'];

const BADGES = ['Nuevo', 'Oferta', 'Destacado', 'Agotándose', ''];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB...');

    await Product.deleteMany({});
    console.log('🧹 Base de datos limpiada...');

    const products = PRODUCT_IMAGES.map((imageUrl) => ({
      name:     faker.commerce.productName(),
      details:  faker.commerce.productDescription(),
      price:    parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      stock:    faker.number.int({ min: 0, max: 100 }),
      category: randomItem(CATEGORIAS),
      image:    imageUrl,
      badge:    randomItem(BADGES),
      active:   true,
    }));

    await Product.insertMany(products);
    console.log(`Seeding completado: ${products.length} productos insertados.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();