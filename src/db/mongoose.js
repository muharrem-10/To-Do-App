const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log('Veritabanı bağlantısı açıldı');
    } catch (error) {
      console.log('Veritabanı bağlantısı başarısız oldu:', error);
    }
  }
  
  const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı');
  } catch (error) {
    console.log('Veritabanı bağlantısı kapatılamadı:', error);
  }
}

module.exports = {
    connectDB,
    disconnectDB,
  }