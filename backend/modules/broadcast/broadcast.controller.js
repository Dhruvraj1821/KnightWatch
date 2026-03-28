import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
  tournamentName: { type: String, required: true },
  roundName:      { type: String, required: true },
  roundId:        { type: String, required: true, unique: true },
  numberOfBoards: { type: Number, required: true },
}, { timestamps: true });

export const Broadcast = mongoose.model('Broadcast', broadcastSchema);