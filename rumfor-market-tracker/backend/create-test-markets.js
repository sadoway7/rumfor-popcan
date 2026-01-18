const mongoose = require('mongoose')
const Market = require('./src/models/Market')
const User = require('./src/models/User')
require('dotenv').config()

async function createTestMarkets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    // Find a promoter user
    const promoter = await User.findOne({ email: 'promoter@rumfor.com' })
    if (!promoter) {
      console.error('Promoter user not found')
      return
    }

    const testMarkets = [
      {
        name: 'Downtown Arts & Crafts Fair',
        description: 'Local artisans showcase their handmade goods in the heart of downtown.',
        category: 'arts-crafts',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '123 Main St',
            city: 'Downtown',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          coordinates: [-118.2437, 34.0522]
        },
        schedule: {
          recurring: true,
          daysOfWeek: ['saturday'],
          startTime: '10:00',
          endTime: '18:00'
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop',
          alt: 'Arts and crafts fair',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@artsfair.com',
          phone: '(555) 123-4567'
        },
        amenities: ['parking', 'restrooms'],
        tags: ['art', 'crafts', 'local']
      },
      {
        name: 'Weekend Flea Market',
        description: 'Vintage treasures and unique finds await at our weekend flea market.',
        category: 'flea-market',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '456 Market St',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA'
          },
          coordinates: [-89.6501, 39.7817]
        },
        schedule: {
          recurring: true,
          daysOfWeek: ['sunday'],
          startTime: '08:00',
          endTime: '16:00'
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
          alt: 'Flea market stalls',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@fleamarket.com'
        },
        amenities: ['parking'],
        tags: ['vintage', 'antiques', 'collectibles']
      },
      {
        name: 'Summer Food Festival',
        description: 'Taste the best local cuisine at our annual summer food festival.',
        category: 'food-festival',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '789 Festival Ave',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            country: 'USA'
          },
          coordinates: [-97.7431, 30.2672]
        },
        schedule: {
          recurring: false,
          startTime: '11:00',
          endTime: '22:00',
          seasonStart: new Date('2024-07-01'),
          seasonEnd: new Date('2024-07-31')
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
          alt: 'Food festival',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@foodfest.com'
        },
        amenities: ['restrooms', 'food_court'],
        tags: ['food', 'festival', 'cuisine']
      },
      {
        name: 'Holiday Craft Show',
        description: 'Find the perfect holiday gifts at our craft show featuring local artisans.',
        category: 'holiday-market',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '321 Holiday Ln',
            city: 'Winterville',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          coordinates: [-74.0060, 40.7128]
        },
        schedule: {
          recurring: false,
          startTime: '10:00',
          endTime: '20:00',
          seasonStart: new Date('2024-12-01'),
          seasonEnd: new Date('2024-12-31')
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
          alt: 'Holiday craft show',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@holidaycrafts.com'
        },
        amenities: ['parking', 'restrooms'],
        tags: ['holiday', 'gifts', 'crafts']
      },
      {
        name: 'Community Night Market',
        description: 'Experience the vibrant night market with street food and entertainment.',
        category: 'night-market',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '555 Night St',
            city: 'Nightville',
            state: 'NV',
            zipCode: '89101',
            country: 'USA'
          },
          coordinates: [-115.1398, 36.1699]
        },
        schedule: {
          recurring: true,
          daysOfWeek: ['friday', 'saturday'],
          startTime: '18:00',
          endTime: '23:00'
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
          alt: 'Night market',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@nightmarket.com'
        },
        amenities: ['parking', 'food_court'],
        tags: ['night', 'food', 'entertainment']
      },
      {
        name: 'Street Fair Extravaganza',
        description: 'Join us for the biggest street fair in town with live music and activities.',
        category: 'street-fair',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '999 Fair Blvd',
            city: 'Carnival City',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          },
          coordinates: [-80.1918, 25.7617]
        },
        schedule: {
          recurring: false,
          startTime: '12:00',
          endTime: '22:00',
          seasonStart: new Date('2024-06-15'),
          seasonEnd: new Date('2024-06-16')
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=400&fit=crop',
          alt: 'Street fair',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@streetfair.com'
        },
        amenities: ['parking', 'restrooms', 'playground'],
        tags: ['street', 'fair', 'music']
      },
      {
        name: 'Vintage & Antique Market',
        description: 'Browse through treasures from the past at our vintage and antique market.',
        category: 'vintage-antique',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '777 Antique Row',
            city: 'Heritage Town',
            state: 'PA',
            zipCode: '19101',
            country: 'USA'
          },
          coordinates: [-75.1652, 39.9526]
        },
        schedule: {
          recurring: false,
          startTime: '09:00',
          endTime: '17:00',
          seasonStart: new Date('2024-04-20'),
          seasonEnd: new Date('2024-04-21')
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=400&fit=crop',
          alt: 'Antique market',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@antiquemarket.com'
        },
        amenities: ['parking', 'restrooms'],
        tags: ['vintage', 'antique', 'collectibles']
      },
      {
        name: 'Summer Community Event',
        description: 'Family-friendly community event with games, food, and local vendors.',
        category: 'community-event',
        promoter: promoter._id,
        createdByType: 'promoter',
        createdBy: promoter._id,
        location: {
          address: {
            street: '222 Community Park',
            city: 'Hometown',
            state: 'OH',
            zipCode: '44101',
            country: 'USA'
          },
          coordinates: [-81.6944, 41.4993]
        },
        schedule: {
          recurring: false,
          startTime: '11:00',
          endTime: '19:00',
          seasonStart: new Date('2024-08-10'),
          seasonEnd: new Date('2024-08-11')
        },
        status: 'active',
        isPublic: true,
        images: [{
          url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
          alt: 'Community event',
          isHero: true,
          uploadedBy: promoter._id,
          uploadedAt: new Date()
        }],
        contact: {
          email: 'info@communityevent.com'
        },
        amenities: ['parking', 'restrooms', 'playground'],
        tags: ['community', 'family', 'fun']
      }
    ]

    for (const marketData of testMarkets) {
      try {
        const market = await Market.create(marketData)
        console.log(`✅ Created market: ${market.name}`)
      } catch (error) {
        console.error(`❌ Failed to create market ${marketData.name}:`, error.message)
      }
    }

  } catch (error) {
    console.error('❌ Error creating test markets:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createTestMarkets()