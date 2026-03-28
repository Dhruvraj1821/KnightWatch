import { Room } from './room.model.js';

export const createRoom = async (req, res) => {
  try {
    const { roomName, broadcastId, focusBoard, password } = req.body;
    const room = await Room.create({
      roomName, broadcastId, focusBoard: focusBoard ?? null,
      password, host: req.user._id, users: [req.user._id],
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { inviteCode, password } = req.body;
    const room = await Room.findOne({ inviteCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.password !== password) return res.status(401).json({ message: 'Wrong password' });

    if (!room.users.includes(req.user._id)) {
      room.users.push(req.user._id);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.users = room.users.filter(u => u.toString() !== req.user._id.toString());
    await room.save();
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('host', 'username').populate('broadcastId');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('host', 'username')
      .populate('users', 'username')
      .populate('broadcastId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};