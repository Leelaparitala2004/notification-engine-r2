require('dotenv').config();
const connectDB = require('./src/config/db');
const Rule = require('./src/models/Rule');

const seedRules = async () => {
  try {
    await connectDB();
    
    const rules = [
      { 
        name: 'Critical alerts always now', 
        conditions: { priority_hint: ['critical'] }, 
        action: 'now', 
        priority: 100,
        description: 'Any critical priority notification should be sent immediately'
      },
      { 
        name: 'Security alerts always now', 
        conditions: { event_type: ['security_alert'] }, 
        action: 'now', 
        priority: 99,
        description: 'Security alerts are always urgent'
      },
      { 
        name: 'No promos at night', 
        conditions: { event_type: ['promo', 'marketing'], hour_range: [22, 8] }, 
        action: 'never', 
        priority: 90,
        description: 'Do not send promotional content between 10 PM and 8 AM'
      },
      { 
        name: 'System events now', 
        conditions: { event_type: ['system'] }, 
        action: 'now', 
        priority: 85,
        description: 'System events should be sent immediately'
      },
      { 
        name: 'Payment notifications now', 
        conditions: { event_type: ['payment'] }, 
        action: 'now', 
        priority: 80,
        description: 'Payment notifications are time-sensitive'
      }
    ];

    // Clear existing rules
    await Rule.deleteMany({});
    console.log('✅ Cleared existing rules');

    // Insert new rules
    const result = await Rule.insertMany(rules);
    console.log(`✅ Seeded ${result.length} rules`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedRules();