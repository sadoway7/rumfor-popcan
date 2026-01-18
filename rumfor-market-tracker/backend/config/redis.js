const redis = require('redis')

// Redis client configuration
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('Redis connection refused')
      return new Error('Redis connection refused')
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('Redis retry time exhausted')
      return new Error('Retry time exhausted')
    }
    if (options.attempt > 10) {
      console.error('Redis retry attempts exhausted')
      return undefined
    }
    // Exponential backoff
    return Math.min(options.attempt * 100, 3000)
  }
})

// Connect to Redis
redisClient.connect().catch(console.error)

// Handle connection events
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis')
})

redisClient.on('ready', () => {
  console.log('🚀 Redis client ready')
})

redisClient.on('end', () => {
  console.log('❌ Redis connection ended')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Redis connection...')
  await redisClient.quit()
  process.exit(0)
})

module.exports = redisClient