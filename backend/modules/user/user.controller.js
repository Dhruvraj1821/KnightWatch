import { User } from './user.model.js';
import {
  signAccessToken, signRefreshToken,
  verifyRefreshToken, setCookies, clearCookies,
} from './user.service.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password });
    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookies(res, accessToken, refreshToken);
    res.status(201).json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookies(res, accessToken, refreshToken);
    res.json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) { user.refreshToken = null; await user.save(); }
    }
    clearCookies(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const { userId } = verifyRefreshToken(token);
    const user = await User.findById(userId);
    if (!user || user.refreshToken !== token)
      return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccess  = signAccessToken(user._id);
    const newRefresh = signRefreshToken(user._id);
    user.refreshToken = newRefresh;
    await user.save();

    setCookies(res, newAccess, newRefresh);
    res.json({ message: 'Token refreshed' });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};