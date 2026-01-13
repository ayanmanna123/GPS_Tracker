import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: [
      'eco-friendly-traveler', 
      'route-explorer', 
      'frequent-rider', 
      'early-adopter',
      'community-champion'
    ]
  }],
  achievements: [{
    name: String,
    description: String,
    earnedDate: Date,
    progress: {
      current: Number,
      target: Number
    }
  }],
  totalTrips: {
    type: Number,
    default: 0
  },
  carbonFootprintSaved: {
    // in kg CO2 equivalent
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Reward', rewardSchema);