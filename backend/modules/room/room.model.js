import mongoose from 'mongoose';
import crypto from 'crypto';

const roomSchema = new mongoose.Schema({
  roomName:    { type: String, required: true },
  host:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  users:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Broadcast', required: true },
  focusBoard:  { type: Number, default: null }, // null = all boards
  inviteCode:  { type: String, default: () => crypto.randomBytes(4).toString('hex').toUpperCase() },
  password:    { type: String, required: true },
  lastPgn:     { type: String, default: '' },
}, { timestamps: true });

export const Room = mongoose.model('Room', roomSchema);