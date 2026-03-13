import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, index: true, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    timestamp: { type: Date, default: Date.now, index: true },
    readStatus: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);

