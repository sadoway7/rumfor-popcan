require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')
const Market = require('./src/models/Market')
const UserMarketTracking = require('./src/models/UserMarketTracking')
const Comment = require('./src/models/Comment')
const Photo = require('./src/models/Photo')
const Todo = require('./src/models/Todo')
const Expense = require('./src/models/Expense')
const Notification = require('./src/models/Notification')
const connectDB = require('./config/database')

// Realistic user data
const realUsers = [
  {
    username: 'sarah_ceramics',
    email: 'sarah@artisanstudio.com',
    password: 'artisan123',
    role: 'user',
    profile: {
      firstName: 'Sarah',
      lastName: 'Chen',
      bio: 'Passionate ceramic artist specializing in functional pottery and decorative pieces. I love connecting with the local community through farmers markets.',
      location: {
        city: 'Portland',
        state: 'Oregon',
        country: 'USA'
      },
      business: {
        name: 'Artisan Studio',
        description: 'Handcrafted ceramics for everyday living - mugs, bowls, vases, and custom pieces',
        website: 'https://sarahceramics.com'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  },
  {
    username: 'mike_market_organizer',
    email: 'mike@communitymarkets.com',
    password: 'promoter123',
    role: 'promoter',
    profile: {
      firstName: 'Mike',
      lastName: 'Rodriguez',
      bio: 'Community market organizer dedicated to supporting local artisans and farmers. I believe in building strong connections between producers and consumers.',
      location: {
        city: 'Austin',
        state: 'Texas',
        country: 'USA'
      },
      business: {
        name: 'Community Markets Inc',
        description: 'Organizing authentic farmers markets and craft fairs throughout Central Texas',
        website: 'https://communitymarkets.com'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  },
  {
    username: 'emma_textiles',
    email: 'emma@handwovenjoy.com',
    password: 'textile123',
    role: 'user',
    profile: {
      firstName: 'Emma',
      lastName: 'Thompson',
      bio: 'Textile artist creating beautiful handwoven scarves, blankets, and home décor. Each piece tells a story of traditional craftsmanship.',
      location: {
        city: 'Asheville',
        state: 'North Carolina',
        country: 'USA'
      },
      business: {
        name: 'Handwoven Joy',
        description: 'Premium handwoven textiles made from sustainable, natural fibers',
        website: 'https://handwovenjoy.com'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      publicProfile: true
    }
  },
  {
    username: 'david_woodworks',
    email: 'david@woodcraftdesigns.com',
    password: 'wood123',
    role: 'user',
    profile: {
      firstName: 'David',
      lastName: 'Johnson',
      bio: 'Master woodworker crafting custom furniture and home accessories. I use locally sourced hardwoods and sustainable practices.',
      location: {
        city: 'Boulder',
        state: 'Colorado',
        country: 'USA'
      },
      business: {
        name: 'Woodcraft Designs',
        description: 'Custom furniture and decorative woodwork made from sustainable materials',
        website: 'https://woodcraftdesigns.com'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  },
  {
    username: 'lisa_organic_farm',
    email: 'lisa@greenvalleyfarm.com',
    password: 'organic123',
    role: 'user',
    profile: {
      firstName: 'Lisa',
      lastName: 'Williams',
      bio: 'Third-generation organic farmer specializing in heirloom vegetables and heritage fruits. Committed to sustainable agriculture and soil health.',
      location: {
        city: 'Sonoma',
        state: 'California',
        country: 'USA'
      },
      business: {
        name: 'Green Valley Organic Farm',
        description: 'Certified organic farm growing seasonal produce using regenerative farming practices',
        website: 'https://greenvalleyfarm.com'
      }
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true
    }
  }
]

// Realistic market data
const realMarkets = [
  {
    name: 'Downtown Portland Saturday Market',
    description: 'Portland\'s iconic outdoor market featuring local artisans, farmers, and food vendors. Operating since 1974, this is the perfect place to discover unique handmade goods and connect with the local community.',
    category: 'arts-crafts',
    location: {
      address: 'Portland State University, 1825 SW Broadway',
      city: 'Portland',
      state: 'Oregon',
      country: 'USA',
      zipCode: '97201',
      coordinates: {
        latitude: 45.5152,
        longitude: -122.6784
      }
    },
    dates: {
      type: 'recurring',
      recurring: {
        frequency: 'weekly',
        daysOfWeek: [6], // Saturday
        timeOfDay: {
          start: '10:00 AM',
          end: '4:00 PM'
        }
      }
    },
    vendorInfo: {
      capacity: 150,
      boothSizes: [
        { size: '10x10', price: 75, description: 'Standard booth space' },
        { size: '10x20', price: 125, description: 'Extended booth for larger vendors' }
      ],
      requirements: ['Oregon business license', 'Insurance certificate', 'Vendor application'],
      applicationDeadline: new Date('2024-12-15'),
      applicationFee: {
        amount: 25,
        currency: 'USD'
      },
      amenities: ['Electricity available', 'Food vendors nearby', 'Public restrooms', 'Parking garage']
    },
    contact: {
      email: 'info@portlandsaturdaymarket.org',
      phone: '(503) 555-0123',
      website: 'https://portlandsaturdaymarket.org',
      socialMedia: {
        facebook: 'PortlandSaturdayMarket',
        instagram: '@pdxsaturdaymarket'
      }
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true,
      restrooms: true
    }
  },
  {
    name: 'Austin Community Farmers Market',
    description: 'A vibrant farmers market in the heart of Austin featuring local produce, artisanal foods, and handcrafted goods. Support local farmers and discover amazing vendors every week.',
    category: 'farmers-market',
    location: {
      address: 'Republic Square, 422 Guadalupe St',
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      zipCode: '78701',
      coordinates: {
        latitude: 30.2672,
        longitude: -97.7431
      }
    },
    dates: {
      type: 'recurring',
      recurring: {
        frequency: 'weekly',
        daysOfWeek: [0, 3], // Sunday and Wednesday
        timeOfDay: {
          start: '9:00 AM',
          end: '2:00 PM'
        }
      }
    },
    vendorInfo: {
      capacity: 80,
      boothSizes: [
        { size: '10x10', price: 45, description: 'Standard farmer/vendor space' }
      ],
      requirements: ['Texas sales tax permit', 'Food safety certification (for prepared foods)', 'Vendor application'],
      applicationDeadline: new Date('2024-12-01'),
      applicationFee: {
        amount: 15,
        currency: 'USD'
      },
      amenities: ['Shade structures', 'Water access', 'Loading zone', 'Customer seating area']
    },
    contact: {
      email: 'vendors@austincommunitymarket.org',
      phone: '(512) 555-0456',
      website: 'https://austincommunitymarket.org'
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true,
      restrooms: true
    }
  },
  {
    name: 'Asheville Holiday Artisan Market',
    description: 'Annual holiday market featuring the region\'s finest artisans and crafters. A magical shopping experience with unique gifts, seasonal treats, and festive entertainment.',
    category: 'holiday-market',
    location: {
      address: 'Asheville City Center, 1 College St',
      city: 'Asheville',
      state: 'North Carolina',
      country: 'USA',
      zipCode: '28801',
      coordinates: {
        latitude: 35.5951,
        longitude: -82.5515
      }
    },
    dates: {
      type: 'one-time',
      events: [
        {
          startDate: new Date('2024-12-14'),
          endDate: new Date('2024-12-15'),
          time: {
            start: '10:00 AM',
            end: '6:00 PM'
          }
        }
      ]
    },
    vendorInfo: {
      capacity: 60,
      boothSizes: [
        { size: '8x8', price: 150, description: 'Premium holiday booth' },
        { size: '8x12', price: 200, description: 'Extended holiday booth' }
      ],
      requirements: ['North Carolina business license', 'Holiday market application', 'Portfolio review'],
      applicationDeadline: new Date('2024-10-15'),
      applicationFee: {
        amount: 50,
        currency: 'USD'
      },
      amenities: ['Holiday decorations provided', 'Gift wrapping station', 'Live music stage', 'Photo booth']
    },
    contact: {
      email: 'holiday@ashevillemarket.com',
      phone: '(828) 555-0789',
      website: 'https://ashevilleholidaymarket.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: false,
      restrooms: true
    }
  }
]

const seedProductionData = async () => {
  try {
    console.log('🌱 Starting production data seeding...')
    
    // Connect to database
    await connectDB()
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Market.deleteMany({}),
      UserMarketTracking.deleteMany({}),
      Comment.deleteMany({}),
      Photo.deleteMany({}),
      Todo.deleteMany({}),
      Expense.deleteMany({}),
      Notification.deleteMany({})
    ])
    
    // Create users
    console.log('👥 Creating realistic users...')
    const createdUsers = []
    
    for (const userData of realUsers) {
      try {
        const user = new User(userData)
        await user.save()
        createdUsers.push(user)
        console.log(`✅ Created ${user.role}: ${user.username}`)
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.username}:`, error.message)
      }
    }
    
    // Create markets
    console.log('🏪 Creating realistic markets...')
    const createdMarkets = []
    
    for (const marketData of realMarkets) {
      try {
        // Assign random promoter
        const promoters = createdUsers.filter(u => u.role === 'promoter')
        if (promoters.length > 0) {
          marketData.promoter = promoters[0]._id
        }
        
        const market = new Market(marketData)
        await market.save()
        createdMarkets.push(market)
        console.log(`✅ Created market: ${market.name}`)
      } catch (error) {
        console.error(`❌ Failed to create market ${marketData.name}:`, error.message)
      }
    }
    
    console.log('\n🎉 Production data seeding completed!')
    console.log('\n📊 Database Summary:')
    console.log(`👥 Users: ${createdUsers.length}`)
    console.log(`🏪 Markets: ${createdMarkets.length}`)
    
    console.log('\n🎯 Login Credentials:')
    console.log('='.repeat(50))
    createdUsers.forEach(user => {
      console.log(`${user.profile.firstName} ${user.profile.lastName} (${user.role})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.username}123`)
      console.log()
    })
    
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
  seedProductionData()
}

module.exports = seedProductionData