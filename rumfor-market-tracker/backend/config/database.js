const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20, // Increased connection pool for better performance
      minPoolSize: 5, // Minimum connections to maintain
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    // Fix username index to be sparse
    try {
      const User = require('../src/models/User')
      const collection = conn.connection.db.collection('users')

      // Check if the old non-sparse username index exists
      const indexes = await collection.indexes()
      const usernameIndex = indexes.find(idx => idx.name === 'username_1')

      if (usernameIndex && !usernameIndex.sparse) {
        console.log('🔧 Dropping old non-sparse username index...')
        await collection.dropIndex('username_1')
        console.log('✅ Old username index dropped')
      }

      // The schema will create the new sparse index
      console.log('✅ Username index check completed')
    } catch (error) {
      console.warn('⚠️  Could not fix username index:', error.message)
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected')
    })

    // Handle app termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('🔌 MongoDB connection closed through app termination')
        process.exit(0)
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error)
        process.exit(1)
      }
    })

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message)
    console.error('MongoDB URI:', process.env.MONGODB_URI ? 'set' : 'not set')
    // Don't exit in production, let the app start and handle errors gracefully
    if (process.env.NODE_ENV === 'development') {
      process.exit(1)
    }
  }
}

module.exports = connectDB