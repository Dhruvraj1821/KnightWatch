import axios from 'axios';
import { Room } from '../modules/room/room.model.js';
import { Broadcast } from '../modules/broadcast/broadcast.model.js';

/**
 * Splits a multi-game PGN string into array of individual game PGNs.
 */
const splitPgn = (pgn) => {
  const games = [];
  const parts = pgn.trim().split(/\n\n(?=\[Event)/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) games.push(trimmed);
  }
  return games;
};

/**
 * Starts interval polling for all active broadcasts.
 * Emits pgn_update to each socket room.
 */
export const startPgnBroadcaster = (io) => {
  setInterval(async () => {
    try {
      const rooms = await Room.find().populate('broadcastId');

      for (const room of rooms) {
        const broadcast = room.broadcastId;
        if (!broadcast?.roundId) continue;

        try {
          const { data: pgn } = await axios.get(
            `https://lichess.org/api/broadcast/round/${broadcast.roundId}.pgn`,
            { headers: { Accept: 'application/x-chess-pgn' }, timeout: 5000 }
          );

          const allGames = splitPgn(pgn);

          let payload;
          if (room.focusBoard !== null && room.focusBoard !== undefined) {
            const idx = room.focusBoard - 1;
            payload = allGames[idx] ? [allGames[idx]] : [];
          } else {
            payload = allGames;
          }

          // Only emit if PGN changed
          const newPgn = payload.join('\n\n');
          if (newPgn === room.lastPgn) continue;

          room.lastPgn = newPgn;
          await room.save();

          io.to(room._id.toString()).emit('pgn_update', { games: payload });
        } catch {
          // Silently skip failed fetches per room
        }
      }
    } catch (err) {
      console.error('PGN broadcaster error:', err.message);
    }
  }, 4000); // Poll every 4s
};