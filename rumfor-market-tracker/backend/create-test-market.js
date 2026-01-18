const mongoose = require('mongoose')
const Market = require('./src/models/Market')
const User = require('./src/models/User')
require('dotenv').config()

async function createTestMarket() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    // Find a promoter user
    const promoter = await User.findOne({ email: 'promoter@rumfor.com' })
    if (!promoter) {
      console.error('Promoter user not found')
      return
    }

    const testMarket = new Market({
      name: 'Test Farmers Market',
      description: 'A test market for development',
      shortDescription: 'Test market',
      promoter: promoter._id,
      createdByType: 'promoter',
      location: {
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TX',
          zipCode: '75001',
          country: 'USA'
        },
        coordinates: [-96.7970, 32.7767] // [lng, lat]
      },
      category: 'farmers-market',
      schedule: {
        recurring: true,
        daysOfWeek: ['saturday', 'sunday'],
        startTime: '08:00',
        endTime: '16:00'
      },
      applicationSettings: {
        acceptVendors: true,
        maxVendors: 50,
        applicationFee: 25,
        boothFee: 50,
        requirements: {
          businessLicense: false,
          insurance: false,
          healthPermit: false,
          liabilityInsurance: false
        },
        customRequirements: []
      },
      images: [{
        url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
        alt: 'Farmers market',
        isHero: true,
        uploadedBy: promoter._id,
        uploadedAt: new Date()
      }],
      contact: {
        email: 'test@market.com',
        phone: '(555) 123-4567'
      },
      amenities: ['parking', 'restrooms'],
      status: 'active',
      isPublic: true,
      tags: ['local', 'organic', 'fresh'],
      createdBy: promoter._id
    })

    await testMarket.save()
    console.log('✅ Test market created:', testMarket.name)

    // Update stats
    await testMarket.updateStats()

    console.log('✅ Market stats updated')
  } catch (error) {
    console.error('❌ Error creating test market:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createTestMarket()