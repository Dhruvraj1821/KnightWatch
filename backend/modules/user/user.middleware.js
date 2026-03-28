import { verifyAccessToken } from './user.service.js';
import { User } from './user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const { userId } = verifyAccessToken(token);
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin only' });
  next();
};