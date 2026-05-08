const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não configurado');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[db] conectado ao MongoDB');
}

module.exports = { connectDB };
