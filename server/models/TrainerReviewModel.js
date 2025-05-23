const mongoose = require('mongoose');

const trainerReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerBooking',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one review per booking
trainerReviewSchema.index({ booking: 1 }, { unique: true });

// Pre-save middleware to validate that user has completed a booking
trainerReviewSchema.pre('save', async function(next) {
  const TrainerBooking = mongoose.model('TrainerBooking');
  const booking = await TrainerBooking.findOne({
    _id: this.booking,
    user: this.user,
    trainer: this.trainer,
    status: 'completed'
  });

  if (!booking) {
    throw new Error('You can only review after completing a session with this trainer');
  }
  next();
});

module.exports = mongoose.model('TrainerReview', trainerReviewSchema); 