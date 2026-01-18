require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')
const connectDB = require('./config/database')

// Test users to create
const testUsers = [
  {
    email: 'sadoway@gmail.com',
    password: 'Oswald1986!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    bio: 'System administrator',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    }
  },
  {
    email: 'admin@rumfor.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    bio: 'System administrator for testing purposes',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    }
  },
  {
    email: 'vendor@rumfor.com',
    password: 'vendor123',
    firstName: 'Test',
    lastName: 'Vendor',
    role: 'vendor',
    bio: 'Artisan vendor for testing market applications',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    }
  },
  {
    email: 'promoter@rumfor.com',
    password: 'promoter123',
    firstName: 'Market',
    lastName: 'Promoter',
    role: 'promoter',
    bio: 'Market event organizer and promoter',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    }
  },
  {
    email: 'user@rumfor.com',
    password: 'user12345',
    firstName: 'Regular',
    lastName: 'User',
    role: 'visitor',
    bio: 'Regular user interested in local markets',
    preferences: {
      emailNotifications: false,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    }
  },
  {
    email: 'artisan@rumfor.com',
    password: 'artisan123',
    firstName: 'Creative',
    lastName: 'Artisan',
    role: 'vendor',
    bio: 'Independent artisan creating unique handcrafted items',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
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
      email: { $in: testUsers.map(user => user.email) }
    })

    // Create test users
    console.log('👥 Creating test users...')
    const createdUsers = []

    for (const userData of testUsers) {
      try {
        const user = new User(userData)
        await user.save()
        createdUsers.push({
          email: user.email,
          password: userData.password,
          role: user.role,
          id: user._id
        })
        console.log(`✅ Created ${user.role}: ${user.email}`)
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message)
      }
    }

    console.log('\n🎉 Test user seeding completed!')
    console.log('\n📋 Available Test Users:')
    console.log('='.repeat(50))

    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.role}`)
      console.log()
    })

    console.log('🚀 Ready to login with any of these accounts!')
    
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