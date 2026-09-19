const mongoose = require('mongoose');
require('dotenv').config();

const { faker } = require('@faker-js/faker');
const Product = require('../src/models/product.model.js');

// Imágenes reales de productos congelados (Unsplash)
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80', // hamburguesas
  'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80', // nuggets
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', // plato carne
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=80', // vegetales congelados
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80', // helado
  'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80', // pizza
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80', // postre
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80', // empanadas
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80', // papas fritas
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', // pizza 2
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80', // hamburguesa 2
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80', // helado 2
  'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=600&q=80', // milanesas
  'https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=600&q=80', // mariscos
  'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&q=80', // frutas congeladas
];

const CATEGORIAS = ['Milanesas', 'Tarteletas', 'Pizzas'];

const NOMBRES_POR_CATEGORIA = {
  'Milanesas': ['Hamburguesas x4', 'Milanesas de Pollo x6', 'Nuggets de Pollo x12', 'Medallones de Carne x8', 'Supremas Rebozadas x4'],
  'Tarteletas': ['Mix Verduras Salteadas 500g', 'Choclo en Grano 400g', 'Espinaca Cortada 500g', 'Brócoli Florets 400g', 'Papas Bastón 1kg'],
  'Pizzas': ['Pizza Muzzarella Grande', 'Empanadas de Carne x12', 'Pizza Napolitana Grande', 'Empanadas de J&Q x12', 'Prepizza x3'],
};

const BADGES = ['Nuevo', 'Oferta', 'Destacado', 'Agotándose', ''];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB...');

    await Product.deleteMany({});
    console.log('🧹 Productos anteriores eliminados...');

    const products = PRODUCT_IMAGES.map((imageUrl) => {
      const category = randomItem(CATEGORIAS);
      const nombres = NOMBRES_POR_CATEGORIA[category];
      return {
        name: randomItem(nombres),
        details: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 500, max: 15000 })),
        stock: faker.number.int({ min: 0, max: 100 }),
        category: category,
        image: imageUrl,
        badge: randomItem(BADGES),
        active: true,
      };
    });

    await Product.insertMany(products);
    console.log(`🧊 Seeding completado: ${products.length} productos congelados insertados.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();