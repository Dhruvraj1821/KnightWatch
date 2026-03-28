import jwt from 'jsonwebtoken';

export const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

export const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export const setCookies = (res, accessToken, refreshToken) => {
  const opts = { httpOnly: true, sameSite: 'strict' };
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

export const clearCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};