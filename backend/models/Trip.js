import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    // kept for backward-compat with older UI
    date: { type: Date },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, default: 0 }, // days
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Moderate', 'Extreme', ''],
      default: 'Medium',
    },
    tripType: {
      type: String,
      enum: ['Trek', 'Road Trip', 'Camping', 'International', ''],
      default: 'Trek',
    },
    description: { type: String, default: '' },
    maxMembers: {
      type: Number,
      default: 10,
      min: 1,
    },
    requiredExperience: {
      type: String,
      enum: ['Beginner', 'Explorer', 'Pro', ''],
      default: 'Beginner',
    },
    requiredFitness: {
      type: String,
      enum: ['Low', 'Medium', 'High', ''],
      default: 'Medium',
    },
    genderPreference: { type: String, default: '' },
    minAge: { type: Number },
    maxAge: { type: Number },

    budget: { type: Number },
    costIncludes: {
      travel: { type: Boolean, default: false },
      stay: { type: Boolean, default: false },
      food: { type: Boolean, default: false },
      guide: { type: Boolean, default: false },
    },
    meetingPoint: { type: String, default: '' },
    transportMode: {
      type: String,
      enum: ['Bus', 'Train', 'Self', 'Flight', ''],
      default: 'Bus',
    },

    thingsToCarry: { type: String, default: '' },
    safetyGuidelines: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    cancellationPolicy: { type: String, default: '' },

    coverImage: {
      type: String,
      required: true,
    },
    additionalPhotos: [{ type: String }],
    routeMap: { type: String, default: '' },

    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    autoApproveRequests: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);

