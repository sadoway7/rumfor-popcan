require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')
const connectDB = require('./config/database')

// Test users to create
const testUsers = [
  {
    username: 'admin',
    email: 'admin@rumfor.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      bio: 'System administrator for testing purposes'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  },
  {
    username: 'vendor',
    email: 'vendor@rumfor.com',
    password: 'vendor',
    role: 'user',
    profile: {
      firstName: 'Test',
      lastName: 'Vendor',
      bio: 'Artisan vendor for testing market applications',
      business: {
        name: 'Handmade Crafts Co',
        description: 'Quality handmade crafts and art pieces'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      publicProfile: true
    }
  },
  {
    username: 'promoter',
    email: 'promoter@rumfor.com',
    password: 'promoter',
    role: 'promoter',
    profile: {
      firstName: 'Market',
      lastName: 'Promoter',
      bio: 'Market event organizer and promoter',
      business: {
        name: 'Community Markets Inc',
        description: 'Organizing local farmers markets and craft fairs'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  },
  {
    username: 'user',
    email: 'user@rumfor.com',
    password: 'user',
    role: 'user',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      bio: 'Regular user interested in local markets'
    },
    preferences: {
      emailNotifications: false,
      pushNotifications: false,
      publicProfile: true
    }
  },
  {
    username: 'artisan',
    email: 'artisan@rumfor.com',
    password: 'artisan',
    role: 'user',
    profile: {
      firstName: 'Creative',
      lastName: 'Artisan',
      bio: 'Independent artisan creating unique handcrafted items',
      business: {
        name: 'Artisan Studio',
        description: 'Custom handcrafted pottery and ceramics'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  }
]

const seedTestUsers = async () => {
  try {
    console.log('🌱 Starting test user seeding...')
    
    // Connect to database
    await connectDB()
    
    // Clear existing test users
    console.log('🧹 Clearing existing test users...')
    await User.deleteMany({
      username: { $in: testUsers.map(user => user.username) }
    })
    
    // Create test users
    console.log('👥 Creating test users...')
    const createdUsers = []
    
    for (const userData of testUsers) {
      try {
        const user = new User(userData)
        await user.save()
        createdUsers.push({
          username: user.username,
          email: user.email,
          role: user.role,
          id: user._id
        })
        console.log(`✅ Created ${user.role}: ${user.username}`)
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.username}:`, error.message)
      }
    }
    
    console.log('\n🎉 Test user seeding completed!')
    console.log('\n📋 Available Test Users:')
    console.log('='.repeat(50))
    
    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Password: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log()
    })
    
    console.log('🚀 Ready to login with any of these accounts!')
    console.log('💡 Use the username as both login and password')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUsers()
}

module.exports = seedTestUsers